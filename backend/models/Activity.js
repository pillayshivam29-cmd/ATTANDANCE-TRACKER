import mongoose from 'mongoose';

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
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const Activity = mongoose.model('Activity', activitySchema);
