import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

export async function registerUser({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) throw { status: 400, message: 'Email already registered' };
  const user = await User.create({ name, email, password, role });
  return toAuthJSON(user);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw { status: 401, message: 'Invalid credentials' };
  const match = await user.comparePassword(password);
  if (!match) throw { status: 401, message: 'Invalid credentials' };
  return toAuthJSON(user);
}

function toAuthJSON(user) {
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      title: user.title,
      specialties: user.specialties,
      experience: user.experience,
      visitingAddress: user.visitingAddress,
      visitingSlots: user.visitingSlots
    },
    token
  };
}

export async function getUserById(id) {
  return User.findById(id).select('-password');
}

export async function updateProfile(userId, payload) {
  const allowed = ['name', 'bio', 'avatar', 'title', 'specialties', 'experience', 'visitingAddress'];
  const data = Object.fromEntries(Object.entries(payload).filter(([k]) => allowed.includes(k)));
  return User.findByIdAndUpdate(userId, data, { new: true }).select('-password');
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };
  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw { status: 400, message: 'Current password incorrect' };
  user.password = newPassword;
  await user.save();
  return true;
}
