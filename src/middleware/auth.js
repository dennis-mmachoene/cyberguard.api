import { formatErrorResponse } from '../utils/responseFormatter.js';

// Ensure user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json(
    formatErrorResponse('Authentication required', 'UNAUTHORIZED')
  );
};

// Ensure user is not authenticated (for login/register routes)
export const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return next();
  }
  
  return res.status(400).json(
    formatErrorResponse('Already authenticated', 'ALREADY_AUTHENTICATED')
  );
};

// Check if user account is active
export const isActive = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      formatErrorResponse('Authentication required', 'UNAUTHORIZED')
    );
  }
  
  if (!req.user.isActive) {
    return res.status(403).json(
      formatErrorResponse('Account is suspended', 'ACCOUNT_SUSPENDED')
    );
  }
  
  return next();
};

// Combined middleware: authenticated and active
export const requireAuth = [isAuthenticated, isActive];