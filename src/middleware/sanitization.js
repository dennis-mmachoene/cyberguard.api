import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { sanitizeInput, sanitizeObject } from '../utils/sanitizers.js';

// MongoDB sanitization to prevent NoSQL injection
export const sanitizeMongo = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection attempt detected in ${req.path}: ${key}`);
  },
});

// XSS protection
export const sanitizeXSS = xss();

// Custom sanitization middleware for request body
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Custom sanitization middleware for query parameters
export const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
};

// Custom sanitization middleware for URL parameters
export const sanitizeParams = (req, res, next) => {
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// Combined sanitization middleware
export const sanitizeAll = [
  sanitizeMongo,
  sanitizeXSS,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
];