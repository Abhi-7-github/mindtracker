import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getUserById } from '../services/authService.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'polo-secret-key-production-jwt-333';

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) ||
      req.cookies?.token;

    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    next({ status: 401, message: 'Invalid or expired session token' });
  }
}


export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
  };
}
