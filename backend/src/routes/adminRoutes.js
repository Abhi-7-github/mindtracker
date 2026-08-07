import express from 'express';
import { body } from 'express-validator';
import * as adminController from '../controllers/adminController.js';
import validate from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes - requires admin role
router.use(requireAuth, requireRole('admin'));

router.get('/psychologists', asyncHandler(adminController.getAllPsychologists));
router.patch(
  '/psychologists/:id/verify',
  [body('status').isIn(['Verified', 'Rejected', 'Pending'])],
  validate,
  asyncHandler(adminController.verifyPsychologist)
);

export default router;
