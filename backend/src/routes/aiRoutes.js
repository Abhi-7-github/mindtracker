import express from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { requireAuth } from '../middleware/authMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';
import * as aiController from '../controllers/aiController.js';

const upload = multer({ dest: path.join(os.tmpdir(), 'uploads') });
const router = express.Router();

router.post('/voice-checkin', requireAuth, upload.single('audio'), asyncHandler(aiController.handleVoiceCheckin));

export default router;
