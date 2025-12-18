import express from 'express';
import {
  getGlobalLeaderboard,
  getLevelLeaderboard,
  getUserLeaderboardEntry,
  getUserRank,
  getTopPerformers,
  getUsersNearRank,
  getLeaderboardStats,
} from '../controllers/leaderboardController.js';
import { requireAuth } from '../middleware/auth.js';
import { validatePagination } from '../middleware/validation.js';
import { generalLimiter } from '../middleware/rateLimit.js';
import { sanitizeAll } from '../middleware/sanitization.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(generalLimiter);
router.use(sanitizeAll);

// Get global leaderboard
router.get('/', validatePagination, getGlobalLeaderboard);

// Get top performers
router.get('/top', getTopPerformers);

// Get leaderboard statistics
router.get('/stats', getLeaderboardStats);

// Get user's leaderboard entry
router.get('/me', getUserLeaderboardEntry);

// Get user's rank
router.get('/me/rank', getUserRank);

// Get users near user's rank
router.get('/me/near', getUsersNearRank);

// Get leaderboard by level
router.get('/level/:level', validatePagination, getLevelLeaderboard);

export default router;