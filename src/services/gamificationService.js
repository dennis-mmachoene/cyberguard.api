import Badge from '../models/Badge.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import AuditLog from '../models/AuditLog.js';

class GamificationService {
  // Check and award badges to user based on criteria
  async checkAndAwardBadges(userId) {
    try {
      const user = await User.findById(userId).populate('earnedBadges');
      const allBadges = await Badge.find({ isActive: true });
      const userProgress = await UserProgress.find({ userId });
      
      const newlyEarnedBadges = [];
      
      for (const badge of allBadges) {
        // Skip if already earned
        if (user.earnedBadges.some(b => b.badgeId === badge.badgeId)) {
          continue;
        }
        
        const earned = await this.checkBadgeCriteria(badge, user, userProgress);
        
        if (earned) {
          await user.awardBadge(badge._id);
          newlyEarnedBadges.push(badge);
          
          // Log badge earned
          await AuditLog.create({
            userId,
            action: 'badge.earned',
            category: 'badge',
            severity: 'info',
            details: {
              badgeId: badge.badgeId,
              badgeName: badge.name,
            },
            metadata: {
              badgeId: badge.badgeId,
            },
          });
        }
      }
      
      return newlyEarnedBadges;
    } catch (error) {
      console.error('Badge checking error:', error);
      return [];
    }
  }

  // Check if user meets badge criteria
  async checkBadgeCriteria(badge, user, userProgress) {
    const { type, value, specificLevel } = badge.criteria;
    
    switch (type) {
      case 'points-earned':
        return user.totalPoints >= value;
      
      case 'modules-completed':
        const completedCount = userProgress.filter(p => p.status === 'completed').length;
        return completedCount >= value;
      
      case 'level-completed':
        if (!specificLevel) return false;
        const levelModulesCount = await this.getModulesCountByLevel(specificLevel);
        const completedLevelModules = userProgress.filter(
          p => p.status === 'completed' && this.getModuleLevel(p.moduleId) === specificLevel
        ).length;
        return completedLevelModules >= levelModulesCount;
      
      case 'perfect-score':
        if (specificLevel) {
          const perfectScores = userProgress.filter(p => {
            if (this.getModuleLevel(p.moduleId) !== specificLevel) return false;
            return p.bestScore === 100;
          }).length;
          const levelModulesCount = await this.getModulesCountByLevel(specificLevel);
          return perfectScores >= levelModulesCount;
        } else {
          const perfectScores = userProgress.filter(p => p.bestScore === 100).length;
          return perfectScores >= value;
        }
      
      case 'first-module':
        return userProgress.length >= 1;
      
      case 'all-modules-level':
        const allCompleted = userProgress.filter(p => p.status === 'completed').length;
        const totalModules = await this.getTotalModulesCount();
        return (allCompleted / totalModules) * 100 >= value;
      
      case 'speed-completion':
        const fastCompletion = userProgress.some(p => {
          if (p.attempts.length === 0) return false;
          return p.attempts.some(a => a.duration <= value);
        });
        return fastCompletion;
      
      default:
        return false;
    }
  }

  // Helper: Get module level from moduleId
  getModuleLevel(moduleId) {
    // Extract level from moduleId pattern (e.g., 'digital-hygiene' is beginner)
    const beginnerModules = ['digital-hygiene', 'password-security', 'phishing-awareness', 'social-engineering', 'safe-browsing'];
    const intermediateModules = ['malware-types', 'network-security', 'encryption-basics', 'secure-communications', 'incident-response'];
    
    if (beginnerModules.includes(moduleId)) return 'beginner';
    if (intermediateModules.includes(moduleId)) return 'intermediate';
    return 'advanced';
  }

  // Helper: Get total modules count
  async getTotalModulesCount() {
    // In production, this would query the database
    return 15; // 5 per level
  }

  // Helper: Get modules count by level
  async getModulesCountByLevel(level) {
    // In production, this would query the database
    return 5; // Each level has 5 modules
  }

  // Get all available badges
  async getAllBadges() {
    try {
      const badges = await Badge.find({ isActive: true }).sort({ order: 1 });
      return badges;
    } catch (error) {
      throw new Error('Failed to fetch badges');
    }
  }

  // Get user's earned badges
  async getUserBadges(userId) {
    try {
      const user = await User.findById(userId).populate('earnedBadges');
      return user.earnedBadges;
    } catch (error) {
      throw new Error('Failed to fetch user badges');
    }
  }

  // Calculate points for correct answer based on difficulty
  calculatePoints(difficulty) {
    const pointsMap = {
      easy: 10,
      medium: 15,
      hard: 20,
    };
    
    return pointsMap[difficulty] || 10;
  }

  // Calculate bonus points for perfect score
  calculatePerfectScoreBonus(totalQuestions) {
    return totalQuestions * 5; // 5 bonus points per question
  }

  // Calculate speed bonus (if completed under estimated time)
  calculateSpeedBonus(duration, estimatedDuration) {
    const durationMinutes = duration / 60;
    if (durationMinutes < estimatedDuration * 0.5) {
      return 50; // Completed in under half the estimated time
    } else if (durationMinutes < estimatedDuration * 0.75) {
      return 25; // Completed in under 75% of estimated time
    }
    return 0;
  }
}

export default new GamificationService();