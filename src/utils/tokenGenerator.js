import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Generate a random token
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate a UUID
export const generateUUID = () => {
  return uuidv4();
};

// Generate a secure random string
export const generateSecureString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  const result = new Array(length);
  
  for (let i = 0; i < length; i++) {
    result[i] = chars[randomBytes[i] % chars.length];
  }
  
  return result.join('');
};

// Generate a numeric code
export const generateNumericCode = (length = 6) => {
  const max = Math.pow(10, length) - 1;
  const min = Math.pow(10, length - 1);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Hash a string using SHA-256
export const hashString = (input) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

// Generate a session ID
export const generateSessionId = () => {
  return generateUUID();
};