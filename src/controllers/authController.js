import passport from 'passport';
import User from '../models/User.js';
import { formatSuccessResponse, formatErrorResponse } from '../utils/responseFormatter.js';
import AuditLog from '../models/AuditLog.js';
import leaderboardService from '../services/leaderboardService.js';

// Register with email and password
export const register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json(
        formatErrorResponse('Email already registered', 'EMAIL_EXISTS')
      );
    }
    
    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      displayName,
      authProvider: 'local',
    });
    
    // Log registration
    await AuditLog.create({
      userId: user._id,
      action: 'auth.login',
      category: 'auth',
      severity: 'info',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    // Log in the user
    req.login(user, async (err) => {
      if (err) {
        return next(err);
      }
      
      // Create leaderboard entry
      await leaderboardService.updateLeaderboardEntry(user._id);
      
      return res.status(201).json(
        formatSuccessResponse(
          {
            user: user.toJSON(),
          },
          'Registration successful'
        )
      );
    });
  } catch (error) {
    next(error);
  }
};

// Login with email and password
export const login = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      // Log failed login
      if (req.body.email) {
        const failedUser = await User.findOne({ email: req.body.email.toLowerCase() });
        if (failedUser) {
          await AuditLog.create({
            userId: failedUser._id,
            action: 'auth.login-failed',
            category: 'auth',
            severity: 'warning',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          });
        }
      }
      
      return res.status(401).json(
        formatErrorResponse(info?.message || 'Authentication failed', 'AUTH_FAILED')
      );
    }
    
    req.login(user, async (err) => {
      if (err) {
        return next(err);
      }
      
      // Log successful login
      await AuditLog.create({
        userId: user._id,
        action: 'auth.login',
        category: 'auth',
        severity: 'info',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      return res.status(200).json(
        formatSuccessResponse(
          {
            user: user.toJSON(),
          },
          'Login successful'
        )
      );
    });
  })(req, res, next);
};

// Logout
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      // Log logout
      await AuditLog.create({
        userId: req.user._id,
        action: 'auth.logout',
        category: 'auth',
        severity: 'info',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }
    
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        
        res.clearCookie('cyberguard.sid');
        return res.status(200).json(
          formatSuccessResponse(null, 'Logout successful')
        );
      });
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json(
        formatErrorResponse('Not authenticated', 'NOT_AUTHENTICATED')
      );
    }
    
    return res.status(200).json(
      formatSuccessResponse({
        user: req.user.toJSON(),
      })
    );
  } catch (error) {
    next(error);
  }
};

// Google OAuth callback
export const googleCallback = async (req, res, next) => {
  try {
    // Log login
    await AuditLog.create({
      userId: req.user._id,
      action: 'auth.login',
      category: 'auth',
      severity: 'info',
      details: {
        provider: 'google',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    // Create or update leaderboard entry
    await leaderboardService.updateLeaderboardEntry(req.user._id);
    
    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
};