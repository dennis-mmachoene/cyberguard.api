import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  logout,
  getCurrentUser,
  googleCallback,
} from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { sanitizeAll } from '../middleware/sanitization.js';

const router = express.Router();

// Register with email/password
router.post('/register', authLimiter, sanitizeAll, isNotAuthenticated, validateRegister, register);

// Login with email/password
router.post('/login', authLimiter, sanitizeAll, isNotAuthenticated, validateLogin, login);

// Logout
router.post('/logout', isAuthenticated, logout);

// Get current user
router.get('/me', isAuthenticated, getCurrentUser);

// Google OAuth
router.get('/google', isNotAuthenticated, passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: `${process.env.FRONTEND_URL}/auth/error`,
}), googleCallback);

export default router;