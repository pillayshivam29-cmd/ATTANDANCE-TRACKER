import mongoose from 'mongoose';

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
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const Settings = mongoose.model('Settings', settingsSchema);
