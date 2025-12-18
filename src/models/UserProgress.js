import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  attemptNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedAnswer: {
      type: Number,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    pointsEarned: {
      type: Number,
      required: true,
      min: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 0,
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0,
  },
  pointsEarned: {
    type: Number,
    required: true,
    min: 0,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
    default: 0,
  },
}, { _id: true });

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    moduleId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
    currentSection: {
      type: Number,
      default: 0,
      min: 0,
    },
    attempts: [attemptSchema],
    bestScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    bestAttemptNumber: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
userProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, status: 1 });
userProgressSchema.index({ userId: 1, isActive: 1 });

// Update best score when new attempt is added
userProgressSchema.methods.addAttempt = function(attemptData) {
  this.attempts.push(attemptData);
  
  if (attemptData.score > this.bestScore) {
    this.bestScore = attemptData.score;
    this.bestAttemptNumber = attemptData.attemptNumber;
  }
  
  // Update total points (only count the best attempt)
  const currentBestPoints = this.attempts
    .filter(a => a.attemptNumber === this.bestAttemptNumber)[0]?.pointsEarned || 0;
  this.totalPointsEarned = currentBestPoints;
  
  return this;
};

// Mark module as started
userProgressSchema.methods.markAsStarted = function() {
  if (this.status === 'not-started') {
    this.status = 'in-progress';
    this.startedAt = new Date();
  }
  this.lastAccessedAt = new Date();
  return this;
};

// Mark module as completed
userProgressSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.lastAccessedAt = new Date();
  return this;
};

// Update last accessed time
userProgressSchema.methods.updateLastAccessed = function() {
  this.lastAccessedAt = new Date();
  return this;
};

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;