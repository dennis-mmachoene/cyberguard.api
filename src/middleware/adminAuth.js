import { formatErrorResponse } from '../utils/responseFormatter.js';

// Ensure user is an admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      formatErrorResponse('Authentication required', 'UNAUTHORIZED')
    );
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json(
      formatErrorResponse('Admin access required', 'FORBIDDEN')
    );
  }
  
  if (!req.user.isActive) {
    return res.status(403).json(
      formatErrorResponse('Admin account is suspended', 'ACCOUNT_SUSPENDED')
    );
  }
  
  return next();
};

// Combined middleware: authenticated, active, and admin
export const requireAdmin = [isAdmin];