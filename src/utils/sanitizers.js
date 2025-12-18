import validator from 'validator';

// Sanitize string input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escape HTML entities
  sanitized = validator.escape(sanitized);
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

// Sanitize object recursively
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize the key
        const sanitizedKey = sanitizeInput(key);
        // Sanitize the value
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  return obj;
};

// Sanitize email
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return email;
  }
  
  return validator.normalizeEmail(email.trim().toLowerCase(), {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  });
};

// Sanitize AI prompt input (strict)
export const sanitizeAIPrompt = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove any potential prompt injection patterns
  let sanitized = input
    .replace(/system:/gi, '')
    .replace(/assistant:/gi, '')
    .replace(/user:/gi, '')
    .replace(/\[INST\]/gi, '')
    .replace(/\[\/INST\]/gi, '')
    .replace(/<\|.*?\|>/g, '')
    .replace(/{{.*?}}/g, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Escape special characters
  sanitized = validator.escape(sanitized);
  
  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized.trim();
};

// Sanitize AI response (ensure no script injection)
export const sanitizeAIResponse = (response) => {
  if (typeof response !== 'string') {
    return '';
  }
  
  // Remove any script tags
  let sanitized = response.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  return sanitized.trim();
};

// Sanitize module ID
export const sanitizeModuleId = (moduleId) => {
  if (typeof moduleId !== 'string') {
    return '';
  }
  
  // Only allow lowercase letters, numbers, and hyphens
  return moduleId.toLowerCase().replace(/[^a-z0-9-]/g, '');
};

// Sanitize username/display name
export const sanitizeDisplayName = (name) => {
  if (typeof name !== 'string') {
    return '';
  }
  
  // Remove HTML and script tags
  let sanitized = name.replace(/<[^>]*>/g, '');
  
  // Only allow alphanumeric, spaces, hyphens, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s-_]/g, '');
  
  // Collapse multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Trim
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  return sanitized;
};

// Remove potential NoSQL injection operators
export const removeNoSQLOperators = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeNoSQLOperators(item));
  }
  
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Skip keys that start with $ (MongoDB operators)
        if (!key.startsWith('$')) {
          cleaned[key] = removeNoSQLOperators(obj[key]);
        }
      }
    }
    return cleaned;
  }
  
  return obj;
};

// Sanitize search query
export const sanitizeSearchQuery = (query) => {
  if (typeof query !== 'string') {
    return '';
  }
  
  // Remove special regex characters
  let sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Limit length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  return sanitized.trim();
};