import mongoose from 'mongoose';

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

// Map MongoDB _id to id for the frontend
personSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const Person = mongoose.model('Person', personSchema);
