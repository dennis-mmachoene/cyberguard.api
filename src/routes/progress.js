import express from 'express';
import {
  startModule,
  submitModuleQuiz,
  getModuleProgress,
  getAllProgress,
  getProgressSummary,
  getActiveModule,
  exitActiveModule,
  updateLastAccessed,
} from '../controllers/progressController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateModuleId, validateModuleSubmission } from '../middleware/validation.js';
import { generalLimiter, submissionLimiter } from '../middleware/rateLimit.js';
import { sanitizeAll } from '../middleware/sanitization.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(sanitizeAll);

// Get progress summary
router.get('/summary', generalLimiter, getProgressSummary);

// Get all progress
router.get('/', generalLimiter, getAllProgress);

// Get active module
router.get('/active', generalLimiter, getActiveModule);

// Exit active module
router.post('/active/exit', generalLimiter, exitActiveModule);

// Start a module
router.post('/modules/:moduleId/start', generalLimiter, validateModuleId, startModule);

// Submit module quiz
router.post('/modules/:moduleId/submit', submissionLimiter, validateModuleId, validateModuleSubmission, submitModuleQuiz);

// Get module progress
router.get('/modules/:moduleId', generalLimiter, validateModuleId, getModuleProgress);

// Update last accessed
router.patch('/modules/:moduleId/accessed', generalLimiter, validateModuleId, updateLastAccessed);

export default router;