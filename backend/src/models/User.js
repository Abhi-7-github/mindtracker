import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

const SlotSchema = new Schema({
  dayOrDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  durationMinutes: { type: Number, default: 50 },
  mode: { type: String, enum: ['In-Person Clinic', 'Online Video', 'Both'], default: 'In-Person Clinic' },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'psychologist', 'admin'], default: 'user' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  // Psychologist specific fields
  isVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
  title: { type: String, default: '' },
  specialties: [{ type: String }],
  experience: { type: String, default: '' },
  visitingAddress: { type: String, default: '' },
  visitingSlots: [SlotSchema],
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default model('User', UserSchema);
