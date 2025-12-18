import validator from 'validator';

// Validate email
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return validator.isEmail(email);
};

// Validate password strength
export const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // At least 8 characters, max 128
  if (password.length < 8 || password.length > 128) {
    return false;
  }
  
  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  
  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }
  
  // Must contain at least one digit
  if (!/\d/.test(password)) {
    return false;
  }
  
  // Must contain at least one special character
  if (!/[@$!%*?&]/.test(password)) {
    return false;
  }
  
  return true;
};

// Validate display name
export const isValidDisplayName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  // Length check
  if (name.length < 2 || name.length > 100) {
    return false;
  }
  
  // Only allow alphanumeric, spaces, hyphens, and underscores
  if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
    return false;
  }
  
  return true;
};

// Validate module ID format
export const isValidModuleId = (moduleId) => {
  if (!moduleId || typeof moduleId !== 'string') {
    return false;
  }
  
  // Only lowercase letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(moduleId);
};

// Validate badge ID format
export const isValidBadgeId = (badgeId) => {
  if (!badgeId || typeof badgeId !== 'string') {
    return false;
  }
  
  // Only lowercase letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(badgeId);
};

// Validate learning level
export const isValidLevel = (level) => {
  return ['beginner', 'intermediate', 'advanced'].includes(level);
};

// Validate badge category
export const isValidBadgeCategory = (category) => {
  return ['achievement', 'milestone', 'mastery', 'special'].includes(category);
};

// Validate badge rarity
export const isValidBadgeRarity = (rarity) => {
  return ['common', 'rare', 'epic', 'legendary'].includes(rarity);
};

// Validate criteria type
export const isValidCriteriaType = (type) => {
  return [
    'points-earned',
    'modules-completed',
    'level-completed',
    'perfect-score',
    'streak',
    'first-module',
    'all-modules-level',
    'speed-completion',
  ].includes(type);
};

// Validate UUID
export const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  return validator.isUUID(uuid);
};

// Validate integer within range
export const isValidInteger = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  if (typeof value !== 'number') {
    return false;
  }
  return Number.isInteger(value) && value >= min && value <= max;
};

// Validate MongoDB ObjectId
export const isValidObjectId = (id) => {
  if (!id) {
    return false;
  }
  return validator.isMongoId(id.toString());
};

// Validate array
export const isValidArray = (arr, minLength = 0, maxLength = Number.MAX_SAFE_INTEGER) => {
  if (!Array.isArray(arr)) {
    return false;
  }
  return arr.length >= minLength && arr.length <= maxLength;
};

// Validate string length
export const isValidStringLength = (str, minLength = 0, maxLength = Number.MAX_SAFE_INTEGER) => {
  if (typeof str !== 'string') {
    return false;
  }
  return str.length >= minLength && str.length <= maxLength;
};

// Validate theme
export const isValidTheme = (theme) => {
  return ['light', 'dark', 'system'].includes(theme);
};

// Validate role
export const isValidRole = (role) => {
  return ['user', 'admin'].includes(role);
};