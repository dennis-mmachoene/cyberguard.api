import LeaderboardEntry from '../models/LeaderboardEntry.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';

class LeaderboardService {
  // Update or create leaderboard entry for user
  async updateLeaderboardEntry(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Count completed modules
      const completedModules = await UserProgress.countDocuments({
        userId,
        status: 'completed',
      });
      
      // Get or create leaderboard entry
      let entry = await LeaderboardEntry.findOne({ userId });
      
      if (!entry) {
        entry = new LeaderboardEntry({
          userId,
          displayName: user.displayName,
          totalPoints: user.totalPoints,
          currentLevel: user.currentLevel,
          badgeCount: user.earnedBadges.length,
          modulesCompleted: completedModules,
        });
      } else {
        entry.displayName = user.displayName;
        entry.totalPoints = user.totalPoints;
        entry.currentLevel = user.currentLevel;
        entry.badgeCount = user.earnedBadges.length;
        entry.modulesCompleted = completedModules;
        entry.lastActivityAt = new Date();
      }
      
      await entry.save();
      
      // Recalculate all ranks
      await this.recalculateRanks();
      
      return entry;
    } catch (error) {
      throw error;
    }
  }

  // Recalculate ranks for all entries
  async recalculateRanks() {
    try {
      // Get all entries sorted by points (descending) and last update (ascending for ties)
      const entries = await LeaderboardEntry.find()
        .sort({ totalPoints: -1, updatedAt: 1 })
        .exec();
      
      // Update ranks
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const newRank = i + 1;
        entry.updateRank(newRank);
        await entry.save();
      }
    } catch (error) {
      throw error;
    }
  }

  // Get global leaderboard
  async getGlobalLeaderboard(page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const entries = await LeaderboardEntry.find()
        .sort({ totalPoints: -1, updatedAt: 1 })
        .skip(skip)
        .limit(limit)
        .select('-userId')
        .lean();
      
      const total = await LeaderboardEntry.countDocuments();
      
      return {
        entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error('Failed to fetch global leaderboard');
    }
  }

  // Get leaderboard by level
  async getLevelLeaderboard(level, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const entries = await LeaderboardEntry.find({ currentLevel: level })
        .sort({ totalPoints: -1, updatedAt: 1 })
        .skip(skip)
        .limit(limit)
        .select('-userId')
        .lean();
      
      const total = await LeaderboardEntry.countDocuments({ currentLevel: level });
      
      return {
        entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error('Failed to fetch level leaderboard');
    }
  }

  // Get user's leaderboard entry
  async getUserLeaderboardEntry(userId) {
    try {
      const entry = await LeaderboardEntry.findOne({ userId });
      
      if (!entry) {
        // Create entry if doesn't exist
        return await this.updateLeaderboardEntry(userId);
      }
      
      return entry;
    } catch (error) {
      throw new Error('Failed to fetch user leaderboard entry');
    }
  }

  // Get user's rank
  async getUserRank(userId) {
    try {
      const entry = await LeaderboardEntry.findOne({ userId });
      
      if (!entry) {
        return null;
      }
      
      return {
        rank: entry.rank,
        previousRank: entry.previousRank,
        rankChange: entry.rankChange,
        totalPoints: entry.totalPoints,
      };
    } catch (error) {
      throw new Error('Failed to fetch user rank');
    }
  }

  // Get top performers (top 10)
  async getTopPerformers() {
    try {
      const entries = await LeaderboardEntry.find()
        .sort({ totalPoints: -1, updatedAt: 1 })
        .limit(10)
        .select('displayName totalPoints currentLevel badgeCount modulesCompleted rank')
        .lean();
      
      return entries;
    } catch (error) {
      throw new Error('Failed to fetch top performers');
    }
  }

  // Get users near a specific rank (for context)
  async getUsersNearRank(rank, range = 5) {
    try {
      const startRank = Math.max(1, rank - range);
      const endRank = rank + range;
      
      const entries = await LeaderboardEntry.find({
        rank: { $gte: startRank, $lte: endRank },
      })
        .sort({ rank: 1 })
        .select('-userId')
        .lean();
      
      return entries;
    } catch (error) {
      throw new Error('Failed to fetch users near rank');
    }
  }

  // Get leaderboard statistics
  async getLeaderboardStats() {
    try {
      const totalUsers = await LeaderboardEntry.countDocuments();
      
      const levelCounts = await LeaderboardEntry.aggregate([
        {
          $group: {
            _id: '$currentLevel',
            count: { $sum: 1 },
          },
        },
      ]);
      
      const topScorer = await LeaderboardEntry.findOne()
        .sort({ totalPoints: -1 })
        .select('displayName totalPoints')
        .lean();
      
      const averagePoints = await LeaderboardEntry.aggregate([
        {
          $group: {
            _id: null,
            avgPoints: { $avg: '$totalPoints' },
          },
        },
      ]);
      
      return {
        totalUsers,
        levelDistribution: levelCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topScorer: topScorer || null,
        averagePoints: averagePoints[0]?.avgPoints || 0,
      };
    } catch (error) {
      throw new Error('Failed to fetch leaderboard statistics');
    }
  }
}

export default new LeaderboardService();