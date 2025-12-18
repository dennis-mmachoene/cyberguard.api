import express from 'express';
import {
  getAllModules,
  getModulesByLevel,
  getModuleById,
  getModuleQuestions,
  enhanceModuleContent,
  searchModules,
  getLearningObjectives,
} from '../controllers/learningController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateModuleId } from '../middleware/validation.js';
import { generalLimiter, aiLimiter } from '../middleware/rateLimit.js';
import { sanitizeAll } from '../middleware/sanitization.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(sanitizeAll);

// Get all modules
router.get('/modules', generalLimiter, getAllModules);

// Get modules by level
router.get('/modules/level/:level', generalLimiter, getModulesByLevel);

// Search modules
router.get('/modules/search', generalLimiter, searchModules);

// Get learning objectives
router.get('/objectives', generalLimiter, getLearningObjectives);

// Get single module
router.get('/modules/:moduleId', generalLimiter, validateModuleId, getModuleById);

// Get module questions
router.get('/modules/:moduleId/questions', generalLimiter, validateModuleId, getModuleQuestions);

// Enhance module content with AI
router.post('/modules/:moduleId/enhance', aiLimiter, validateModuleId, enhanceModuleContent);

export default router;