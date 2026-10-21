import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema(
  {
    personId: { type: String, required: true },
    personName: { type: String, required: true },
    employeeId: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
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

// Prevent duplicate attendance for the same person on the same date
attendanceRecordSchema.index({ personId: 1, date: 1 }, { unique: true });

attendanceRecordSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
