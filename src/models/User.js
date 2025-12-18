import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import environment from '../config/environment.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: function() {
        return this.authProvider === 'local';
      },
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
      required: true,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    earnedBadges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
    }],
    loginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for leaderboard queries
userSchema.index({ totalPoints: -1, updatedAt: -1 });
userSchema.index({ currentLevel: 1, totalPoints: -1 });
userSchema.index({ role: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and user uses local auth
  if (!this.isModified('password') || this.authProvider !== 'local') {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(environment.auth.bcrypt.rounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  
  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account if max attempts reached
  if (this.loginAttempts + 1 >= environment.auth.maxLoginAttempts) {
    updates.$set = { lockUntil: Date.now() + environment.auth.lockoutDuration };
  }
  
  return await this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Add points to user
userSchema.methods.addPoints = async function(points) {
  this.totalPoints += points;
  return await this.save();
};

// Award badge to user
userSchema.methods.awardBadge = async function(badgeId) {
  if (!this.earnedBadges.includes(badgeId)) {
    this.earnedBadges.push(badgeId);
    return await this.save();
  }
  return this;
};

const User = mongoose.model('User', userSchema);

export default User;