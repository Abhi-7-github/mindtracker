import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

function attachListeners() {
  const c = mongoose.connection;
  c.on('connecting', () => console.info('[MongoDB] connecting'));
  c.on('connected', () => console.info('[MongoDB] connected'));
  c.on('reconnected', () => console.info('[MongoDB] reconnected'));
  c.on('error', (err) => console.error('[MongoDB] error', err));
  c.on('disconnected', () => console.warn('[MongoDB] disconnected'));
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  attachListeners();
  // Use defaults for mongoose v7+, avoid deprecated options like keepAlive
  await mongoose.connect(uri);
}

export function getDBState() {
  const code = mongoose.connection.readyState;
  return { code, state: STATES[code] ?? 'unknown' };
}
