import User from '../models/User.js';
import { formatSuccessResponse, formatErrorResponse } from '../utils/responseFormatter.js';
import { verifyPasswordStrength } from '../utils/passwordHasher.js';
import AuditLog from '../models/AuditLog.js';
import gamificationService from '../services/gamificationService.js';
import progressTrackingService from '../services/progressTrackingService.js';
import auditService from '../services/auditService.js';

// Get user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('earnedBadges');
    
    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 'USER_NOT_FOUND')
      );
    }
    
    // Get progress summary
    const progressSummary = await progressTrackingService.getUserProgressSummary(user._id);
    
    return res.status(200).json(
      formatSuccessResponse({
        user: user.toJSON(),
        progress: progressSummary,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { displayName, preferences } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 'USER_NOT_FOUND')
      );
    }
    
    // Update fields
    if (displayName) {
      user.displayName = displayName;
    }
    
    if (preferences) {
      if (preferences.theme) {
        user.preferences.theme = preferences.theme;
      }
      if (typeof preferences.notifications === 'boolean') {
        user.preferences.notifications = preferences.notifications;
      }
    }
    
    await user.save();
    
    // Log profile update
    await AuditLog.create({
      userId: user._id,
      action: 'user.profile-updated',
      category: 'user',
      severity: 'info',
      details: {
        fields: Object.keys(req.body),
      },
    });
    
    return res.status(200).json(
      formatSuccessResponse(
        { user: user.toJSON() },
        'Profile updated successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 'USER_NOT_FOUND')
      );
    }
    
    // Check if user uses local authentication
    if (user.authProvider !== 'local') {
      return res.status(400).json(
        formatErrorResponse(
          'Cannot change password for OAuth accounts',
          'INVALID_AUTH_PROVIDER'
        )
      );
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json(
        formatErrorResponse('Current password is incorrect', 'INCORRECT_PASSWORD')
      );
    }
    
    // Verify new password strength
    const passwordCheck = verifyPasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
      return res.status(400).json(
        formatErrorResponse(
          'New password does not meet requirements',
          'WEAK_PASSWORD',
          passwordCheck.issues
        )
      );
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Log password change
    await AuditLog.create({
      userId: user._id,
      action: 'auth.password-changed',
      category: 'auth',
      severity: 'info',
    });
    
    return res.status(200).json(
      formatSuccessResponse(null, 'Password changed successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get user badges
export const getUserBadges = async (req, res, next) => {
  try {
    const badges = await gamificationService.getUserBadges(req.user._id);
    
    return res.status(200).json(
      formatSuccessResponse({ badges })
    );
  } catch (error) {
    next(error);
  }
};

// Get user statistics
export const getUserStats = async (req, res, next) => {
  try {
    const progressSummary = await progressTrackingService.getUserProgressSummary(req.user._id);
    const recentActivity = await auditService.getRecentActivity(req.user._id, 20);
    
    return res.status(200).json(
      formatSuccessResponse({
        stats: progressSummary,
        recentActivity,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Get user activity history
export const getUserActivity = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    
    const result = await auditService.getUserLogs(req.user._id, page, limit);
    
    return res.status(200).json(
      formatSuccessResponse({
        activity: result.logs,
        pagination: result.pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};