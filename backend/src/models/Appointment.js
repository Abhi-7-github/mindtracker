import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const AppointmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  psychologist: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // e.g. "2026-08-20" or Date string
  timeSlot: { type: String, required: true }, // e.g. "10:00 AM"
  duration: { type: Number, default: 50 },
  mode: { type: String, enum: ['In-Person Clinic', 'Online Video'], default: 'Online Video' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  meetingId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

export default model('Appointment', AppointmentSchema);
