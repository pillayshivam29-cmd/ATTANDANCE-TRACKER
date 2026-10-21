import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendly';

// Middleware
app.use(cors());
app.use(express.json());

// --------------------------------------------------------------------------
// 1. Mongoose Schemas & Models
// --------------------------------------------------------------------------

// Person / Member Schema
const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    role: { type: String, default: 'Member' },
    phone: { type: String, default: '' },
    joinDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    attendancePercentage: { type: Number, default: 100 },
    initials: { type: String, default: '' },
  },
  { timestamps: true }
);

personSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Person = mongoose.model('Person', personSchema);

// Attendance Record Schema
const attendanceSchema = new mongoose.Schema(
  {
    personId: { type: String, required: true },
    personName: { type: String, required: true },
    employeeId: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true },
    checkIn: { type: String, default: '09:00 AM' },
    checkOut: { type: String, default: '05:00 PM' },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day'],
      required: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

attendanceSchema.index({ personId: 1, date: 1 }, { unique: true });

attendanceSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceSchema);

// Activity Schema
const activitySchema = new mongoose.Schema(
  {
    personName: { type: String, required: true },
    department: { type: String, required: true },
    type: { type: String, default: 'marked' },
    status: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  { timestamps: true }
);

activitySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Activity = mongoose.model('Activity', activitySchema);

// Settings Schema
const settingsSchema = new mongoose.Schema({
  orgName: { type: String, default: 'Attendly Systems Inc.' },
  adminName: { type: String, default: 'Alex Morgan' },
  adminEmail: { type: String, default: 'alex.morgan@attendly.io' },
  timezone: { type: String, default: 'America/New_York (UTC-4)' },
  defaultCheckIn: { type: String, default: '09:00' },
  defaultCheckOut: { type: String, default: '17:00' },
  gracePeriodMins: { type: Number, default: 15 },
  lateThresholdMins: { type: Number, default: 30 },
  halfDayMinHours: { type: Number, default: 4 },
  theme: { type: String, default: 'monochrome-light' },
  workingDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
});

settingsSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Settings = mongoose.model('Settings', settingsSchema);

// --------------------------------------------------------------------------
// 2. REST API Routes
// --------------------------------------------------------------------------

// Get all people
app.get('/api/people', async (_req: Request, res: Response) => {
  try {
    const people = await Person.find().sort({ name: 1 });
    res.json(people);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create person
app.post('/api/people', async (req: Request, res: Response) => {
  try {
    const person = new Person(req.body);
    await person.save();
    res.status(201).json(person);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update person
app.put('/api/people/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await Person.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete person
app.delete('/api/people/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await Person.findByIdAndDelete(id);
    await AttendanceRecord.deleteMany({ personId: id });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 BULK UPLOAD STUDENTS (File se ek saath bache MongoDB mein dalne ke liye)
app.post('/api/people/bulk', async (req: Request, res: Response) => {
  try {
    const students = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of students' });
    }

    const formattedStudents = students.map((s) => {
      const parts = (s.name || '').trim().split(' ');
      const initials =
        parts.length > 1
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : (parts[0] || 'ST').slice(0, 2).toUpperCase();

      return {
        name: s.name,
        employeeId: s.employeeId || s.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        email: s.email || `${(s.name || 'student').toLowerCase().replace(/\s+/g, '.')}@school.edu`,
        department: s.department || s.class || 'General',
        role: s.role || 'Student',
        phone: s.phone || '',
        status: 'active',
        attendancePercentage: 100,
        initials,
      };
    });

    const result = await Person.insertMany(formattedStudents, { ordered: false });
    res.status(201).json({ message: `${result.length} students uploaded successfully!`, count: result.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance
app.get('/api/attendance', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const filter = date ? { date: String(date) } : {};
    const records = await AttendanceRecord.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark / Update attendance
app.post('/api/attendance', async (req: Request, res: Response) => {
  try {
    const { personId, personName, employeeId, department, date, status, checkIn, checkOut, notes } = req.body;

    const record = await AttendanceRecord.findOneAndUpdate(
      { personId: String(personId), date: String(date) },
      { personName, employeeId, department, status, checkIn, checkOut, notes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update member's attendance percentage
    const allRecords = await AttendanceRecord.find({ personId: String(personId) });
    if (allRecords.length > 0) {
      let score = 0;
      allRecords.forEach((r) => {
        if (r.status === 'present') score += 1;
        else if (r.status === 'late') score += 0.85;
        else if (r.status === 'half-day') score += 0.5;
      });
      const attendancePercentage = Number(((score / allRecords.length) * 100).toFixed(1));
      await Person.findByIdAndUpdate(String(personId), { attendancePercentage });
    }

    // Log Activity
    await Activity.create({
      personName,
      department,
      type: 'marked',
      status,
      timestamp: checkIn && checkIn !== '--' ? checkIn : 'Logged',
    });

    res.json(record);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete attendance record
app.delete('/api/attendance/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await AttendanceRecord.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get activities
app.get('/api/activities', async (_req: Request, res: Response) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(20);
    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Settings
app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(String(settings._id), req.body, { new: true });
    }
    res.json(settings);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --------------------------------------------------------------------------
// 3. Connect MongoDB & Start Server
// --------------------------------------------------------------------------
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(' Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(` Attendly API server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB Connection Error:', err.message);
  });
  