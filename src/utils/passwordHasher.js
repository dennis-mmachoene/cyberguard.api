import bcrypt from 'bcrypt';
import environment from '../config/environment.js';

// Hash a password
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(environment.auth.bcrypt.rounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
};

// Compare password with hash
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Failed to compare password');
  }
};

// Verify password strength
export const verifyPasswordStrength = (password) => {
  const issues = [];
  
  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    issues.push('Password must not exceed 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    issues.push('Password must contain at least one digit');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    issues.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
};