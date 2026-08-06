import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })], validate, asyncHandler(authController.register));
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));
router.put('/profile', requireAuth, asyncHandler(authController.updateProfile));
router.post('/change-password', requireAuth, [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })], validate, asyncHandler(authController.changePassword));

export default router;
