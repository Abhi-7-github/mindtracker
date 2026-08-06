import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const AppointmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  psychologist: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, default: 50 },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  meetingId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

export default model('Appointment', AppointmentSchema);
