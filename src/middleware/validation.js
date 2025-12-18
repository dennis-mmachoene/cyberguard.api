import { body, param, query, validationResult } from 'express-validator';
import { formatErrorResponse } from '../utils/responseFormatter.js';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    
    return res.status(400).json(
      formatErrorResponse('Validation failed', 'VALIDATION_ERROR', formattedErrors)
    );
  }
  
  next();
};

// Authentication validation rules
export const validateRegister = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('displayName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s-_]+$/)
    .withMessage('Display name can only contain letters, numbers, spaces, hyphens, and underscores'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// Module validation rules
export const validateModuleId = [
  param('moduleId')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid module ID format'),
  handleValidationErrors,
];

export const validateModuleSubmission = [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers array is required'),
  body('answers.*.questionId')
    .isMongoId()
    .withMessage('Valid question ID is required'),
  body('answers.*.selectedAnswer')
    .isInt({ min: 0 })
    .withMessage('Valid answer index is required'),
  body('answers.*.timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive number'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number'),
  handleValidationErrors,
];

// Admin validation rules
export const validateCreateModule = [
  body('moduleId')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Module ID must contain only lowercase letters, numbers, and hyphens'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('level')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be beginner, intermediate, or advanced'),
  body('order')
    .isInt({ min: 0 })
    .withMessage('Order must be a positive number'),
  body('content.introduction')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Introduction is required'),
  body('content.sections')
    .isArray({ min: 1 })
    .withMessage('At least one section is required'),
  body('content.summary')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Summary is required'),
  body('questions')
    .isArray({ min: 3 })
    .withMessage('At least 3 questions are required'),
  body('estimatedDuration')
    .isInt({ min: 5 })
    .withMessage('Estimated duration must be at least 5 minutes'),
  body('learningObjectives')
    .isArray({ min: 1 })
    .withMessage('At least one learning objective is required'),
  handleValidationErrors,
];

export const validateCreateBadge = [
  body('badgeId')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Badge ID must contain only lowercase letters, numbers, and hyphens'),
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .isIn(['achievement', 'milestone', 'mastery', 'special'])
    .withMessage('Invalid badge category'),
  body('rarity')
    .isIn(['common', 'rare', 'epic', 'legendary'])
    .withMessage('Invalid badge rarity'),
  body('criteria.type')
    .isIn([
      'points-earned',
      'modules-completed',
      'level-completed',
      'perfect-score',
      'streak',
      'first-module',
      'all-modules-level',
      'speed-completion',
    ])
    .withMessage('Invalid criteria type'),
  handleValidationErrors,
];

// Chatbot validation rules
export const validateChatbotQuery = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .matches(/^[^<>{}]*$/)
    .withMessage('Message contains invalid characters'),
  body('sessionId')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Invalid session ID format'),
  handleValidationErrors,
];

// User profile validation rules
export const validateUpdateProfile = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s-_]+$/)
    .withMessage('Display name can only contain letters, numbers, spaces, hyphens, and underscores'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
  body('preferences.notifications')
    .optional()
    .isBoolean()
    .withMessage('Notifications must be a boolean'),
  handleValidationErrors,
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain uppercase, lowercase, number, and special character'),
  handleValidationErrors,
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

// ID validation
export const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors,
];