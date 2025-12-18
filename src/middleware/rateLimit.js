import rateLimit from 'express-rate-limit';
import MongoStore from 'rate-limit-mongo';
import environment from '../config/environment.js';
import { formatErrorResponse } from '../utils/responseFormatter.js';
import AuditLog from '../models/AuditLog.js';

// Create custom handler for rate limit exceeded
const rateLimitHandler = async (req, res) => {
  // Log rate limit exceeded
  if (req.user) {
    await AuditLog.create({
      userId: req.user._id,
      action: 'security.rate-limit-exceeded',
      category: 'security',
      severity: 'warning',
      details: {
        path: req.path,
        method: req.method,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }
  
  res.status(429).json(
    formatErrorResponse(
      'Too many requests. Please try again later.',
      'RATE_LIMIT_EXCEEDED'
    )
  );
};

// Skip rate limiting for successful requests (only count failed attempts for auth)
const skipSuccessfulRequests = (req, res) => res.statusCode < 400;

// General rate limiter for all API endpoints
export const generalLimiter = rateLimit({
  windowMs: environment.rateLimit.windowMs,
  max: environment.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: new MongoStore({
    uri: environment.database.uri,
    collectionName: 'rateLimitGeneral',
    expireTimeMs: environment.rateLimit.windowMs,
  }),
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: new MongoStore({
    uri: environment.database.uri,
    collectionName: 'rateLimitAuth',
    expireTimeMs: 15 * 60 * 1000,
  }),
});

// Rate limiter for AI-powered endpoints (chatbot, content generation)
export const aiLimiter = rateLimit({
  windowMs: environment.rateLimit.windowMs,
  max: environment.rateLimit.aiMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: new MongoStore({
    uri: environment.database.uri,
    collectionName: 'rateLimitAI',
    expireTimeMs: environment.rateLimit.windowMs,
  }),
  keyGenerator: (req) => {
    // Rate limit per user for authenticated requests
    return req.user ? req.user._id.toString() : req.ip;
  },
});

// Rate limiter for module submission endpoints
export const submissionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 submissions per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: new MongoStore({
    uri: environment.database.uri,
    collectionName: 'rateLimitSubmissions',
    expireTimeMs: 5 * 60 * 1000,
  }),
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
});

// Rate limiter for admin endpoints
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: new MongoStore({
    uri: environment.database.uri,
    collectionName: 'rateLimitAdmin',
    expireTimeMs: 15 * 60 * 1000,
  }),
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
});