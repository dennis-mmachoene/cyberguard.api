import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    totalPoints: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currentLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    badgeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    modulesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    rank: {
      type: Number,
      default: 0,
      min: 0,
    },
    previousRank: {
      type: Number,
      default: 0,
      min: 0,
    },
    rankChange: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for leaderboard queries
leaderboardEntrySchema.index({ totalPoints: -1, updatedAt: -1 });
leaderboardEntrySchema.index({ currentLevel: 1, totalPoints: -1 });
leaderboardEntrySchema.index({ rank: 1 });

// Update rank change
leaderboardEntrySchema.methods.updateRank = function(newRank) {
  this.previousRank = this.rank || newRank;
  this.rank = newRank;
  this.rankChange = this.previousRank - newRank;
  return this;
};

const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);

export default LeaderboardEntry;