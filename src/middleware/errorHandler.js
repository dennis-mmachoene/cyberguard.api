import environment from '../config/environment.js';
import { formatErrorResponse } from '../utils/responseFormatter.js';

// Handle 404 errors
export const notFound = (req, res, next) => {
  res.status(404).json(
    formatErrorResponse(
      `Route not found: ${req.method} ${req.originalUrl}`,
      'NOT_FOUND'
    )
  );
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    
    return res.status(400).json(
      formatErrorResponse('Validation failed', 'VALIDATION_ERROR', errors)
    );
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json(
      formatErrorResponse(
        `${field} already exists`,
        'DUPLICATE_ERROR'
      )
    );
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json(
      formatErrorResponse('Invalid ID format', 'INVALID_ID')
    );
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      formatErrorResponse('Invalid token', 'INVALID_TOKEN')
    );
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      formatErrorResponse('Token expired', 'TOKEN_EXPIRED')
    );
  }
  
  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = environment.node.isProduction
    ? 'An error occurred. Please try again later.'
    : err.message;
  
  res.status(statusCode).json(
    formatErrorResponse(
      message,
      'SERVER_ERROR',
      environment.node.isDevelopment ? err.stack : undefined
    )
  );
};