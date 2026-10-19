import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:5173' })); // Allow Attendly frontend
app.use(express.json());

// 1. Members / People Endpoints
app.get('/api/people', async (req, res) => {
  const people = await prisma.person.findMany({ orderBy: { name: 'asc' } });
  res.json(people);
});

app.post('/api/people', async (req, res) => {
  const person = await prisma.person.create({ data: req.body });
  res.status(201).json(person);
});

app.delete('/api/people/:id', async (req, res) => {
  await prisma.person.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// 2. Attendance Endpoints
app.get('/api/attendance', async (req, res) => {
  const { date } = req.query;
  const where = date ? { date: String(date) } : {};
  const records = await prisma.attendanceRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json(records);
});

app.post('/api/attendance', async (req, res) => {
  const { personId, personName, employeeId, department, date, status, checkIn, checkOut, notes } = req.body;

  // Upsert: create if new, update if already logged for this date
  const record = await prisma.attendanceRecord.upsert({
    where: { personId_date: { personId, date } },
    update: { status, checkIn, checkOut, notes },
    create: { personId, personName, employeeId, department, date, status, checkIn, checkOut, notes },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      personName,
      department,
      type: 'marked',
      status,
      timestamp: checkIn !== '--' ? checkIn : 'Logged',
    },
  });

  res.json(record);
});

// 3. Settings Endpoints
app.get('/api/settings', async (req, res) => {
  const settings = await prisma.appSettings.findFirst();
  res.json(settings);
});

app.put('/api/settings', async (req, res) => {
  const updated = await prisma.appSettings.upsert({
    where: { id: 'default-settings' },
    update: req.body,
    create: { id: 'default-settings', ...req.body },
  });
  res.json(updated);
});

app.listen(PORT, () => {
  console.log(`Attendly API Server running at http://localhost:${PORT}`);
});