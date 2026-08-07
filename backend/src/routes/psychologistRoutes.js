import express from 'express';
import { body } from 'express-validator';
import * as psychologistController from '../controllers/psychologistController.js';
import validate from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Patient accessible verified psychologists list
router.get('/verified', requireAuth, asyncHandler(psychologistController.getVerifiedPsychologists));

// Psychologist-only routes
router.get('/slots', requireAuth, requireRole('psychologist'), asyncHandler(psychologistController.getVisitingSlots));
router.post(
  '/slots',
  requireAuth,
  requireRole('psychologist'),
  [
    body('dayOrDate').notEmpty().withMessage('Day or date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required')
  ],
  validate,
  asyncHandler(psychologistController.addVisitingSlot)
);
router.delete('/slots/:slotId', requireAuth, requireRole('psychologist'), asyncHandler(psychologistController.deleteVisitingSlot));

export default router;
