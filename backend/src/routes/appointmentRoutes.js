import express from 'express';
import { body } from 'express-validator';
import * as appointmentController from '../controllers/appointmentController.js';
import validate from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post(
  '/',
  [
    body('psychologistId').notEmpty().withMessage('Psychologist ID is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required')
  ],
  validate,
  asyncHandler(appointmentController.bookAppointment)
);

router.get('/', asyncHandler(appointmentController.getMyAppointments));

router.patch(
  '/:id/status',
  [body('status').isIn(['Confirmed', 'Cancelled', 'Completed', 'Pending'])],
  validate,
  asyncHandler(appointmentController.updateAppointmentStatus)
);

export default router;
