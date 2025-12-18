import express from 'express';
import {
  sendMessage,
  getChatHistory,
  endChatSession,
  getRecentSessions,
} from '../controllers/chatbotController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateChatbotQuery } from '../middleware/validation.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { sanitizeAll } from '../middleware/sanitization.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(sanitizeAll);

// Send message to chatbot
router.post('/message', aiLimiter, validateChatbotQuery, sendMessage);

// Get chat history
router.get('/sessions/:sessionId', getChatHistory);

// End chat session
router.post('/sessions/:sessionId/end', endChatSession);

// Get recent sessions
router.get('/sessions', getRecentSessions);

export default router;