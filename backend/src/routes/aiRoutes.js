import express from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { requireAuth } from '../middleware/authMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';
import * as aiController from '../controllers/aiController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `voice-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });
const router = express.Router();


router.post('/voice-checkin', requireAuth, upload.single('audio'), asyncHandler(aiController.handleVoiceCheckin));
router.get('/latest-session', requireAuth, asyncHandler(aiController.getLatestSession));
router.get('/session/:sessionId', requireAuth, asyncHandler(aiController.getSessionById));
router.get('/journals', requireAuth, asyncHandler(aiController.getJournals));
router.post('/journals', requireAuth, asyncHandler(aiController.createJournal));

export default router;

