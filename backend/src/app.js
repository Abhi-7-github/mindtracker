import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import psychologistRoutes from './routes/psychologistRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
const rawClientUrl = process.env.CLIENT_URL || '';
const cleanClientUrl = rawClientUrl.replace(/\/$/, '');

const allowedOrigins = [
  'https://poloai-psi.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  ...(cleanClientUrl ? [cleanClientUrl] : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(normalized) ||
      normalized.endsWith('.vercel.app') ||
      normalized.includes('localhost') ||
      normalized.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    // Fallback: allow origin to prevent blocking deployed frontend
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/psychologist', psychologistRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => res.json({ success: true, message: 'OK' }));

app.use(errorHandler);

export default app;
