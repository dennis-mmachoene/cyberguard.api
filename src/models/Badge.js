import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    badgeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['achievement', 'milestone', 'mastery', 'special'],
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      default: 'all',
    },
    criteria: {
      type: {
        type: String,
        enum: [
          'points-earned',
          'modules-completed',
          'level-completed',
          'perfect-score',
          'streak',
          'first-module',
          'all-modules-level',
          'speed-completion',
        ],
        required: true,
      },
      value: {
        type: Number,
        default: 0,
      },
      specificLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
      },
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
badgeSchema.index({ category: 1, level: 1 });
badgeSchema.index({ isActive: 1, order: 1 });
badgeSchema.index({ rarity: 1 });

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;