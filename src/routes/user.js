import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserBadges,
  getUserStats,
  getUserActivity,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateUpdateProfile, validateChangePassword, validatePagination } from '../middleware/validation.js';
import { generalLimiter } from '../middleware/rateLimit.js';
import { sanitizeAll } from '../middleware/sanitization.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(generalLimiter);
router.use(sanitizeAll);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', validateUpdateProfile, updateProfile);

// Change password
router.put('/password', validateChangePassword, changePassword);

// Get user badges
router.get('/badges', getUserBadges);

// Get user statistics
router.get('/stats', getUserStats);

// Get user activity history
router.get('/activity', validatePagination, getUserActivity);

export default router;