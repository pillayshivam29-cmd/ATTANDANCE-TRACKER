import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { Person } from './models/person.js';
import { AttendanceRecord } from './models/AttendanceRecord.js';
import { Activity } from './models/Activity.js';
import { Settings } from './models/Settings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// ----------------------------------------------------
// 1. PEOPLE / MEMBERS ROUTES
// ----------------------------------------------------
app.get('/api/people', async (req, res) => {
  try {
    const people = await Person.find().sort({ name: 1 });
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/people', async (req, res) => {
  try {
    const person = new Person(req.body);
    await person.save();
    res.status(201).json(person);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/people/:id', async (req, res) => {
  try {
    const updated = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/people/:id', async (req, res) => {
  try {
    const person = await Person.findByIdAndDelete(req.params.id);
    if (person) {
      // Remove all attendance records associated with this person
      await AttendanceRecord.deleteMany({ personId: req.params.id });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. ATTENDANCE RECORDS ROUTES
// ----------------------------------------------------
app.get('/api/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};
    const records = await AttendanceRecord.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { personId, personName, employeeId, department, date, status, checkIn, checkOut, notes } = req.body;

    // Upsert: update existing entry if already logged on that date, or create new
    const record = await AttendanceRecord.findOneAndUpdate(
      { personId, date },
      { personName, employeeId, department, status, checkIn, checkOut, notes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate person's attendance percentage
    const allRecordsForPerson = await AttendanceRecord.find({ personId });
    if (allRecordsForPerson.length > 0) {
      let score = 0;
      allRecordsForPerson.forEach((r) => {
        if (r.status === 'present') score += 1;
        else if (r.status === 'late') score += 0.85;
        else if (r.status === 'half-day') score += 0.5;
      });
      const attendancePercentage = Number(((score / allRecordsForPerson.length) * 100).toFixed(1));
      await Person.findByIdAndUpdate(personId, { attendancePercentage });
    }

    // Log Activity
    await Activity.create({
      personName,
      department,
      type: 'marked',
      status,
      timestamp: checkIn !== '--' ? checkIn : 'Logged',
    });

    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/attendance/:id', async (req, res) => {
  try {
    const updated = await AttendanceRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/attendance/:id', async (req, res) => {
  try {
    await AttendanceRecord.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. ACTIVITIES ROUTE
// ----------------------------------------------------
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(20);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. SETTINGS ROUTE
// ----------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(` Attendly Backend API listening at http://localhost:${PORT}`);
});
