import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';
import LearningModule from '../models/LearningModule.js';
import gamificationService from './gamificationService.js';
import AuditLog from '../models/AuditLog.js';

class ProgressTrackingService {
  // Get or create user progress for a module
  async getOrCreateProgress(userId, moduleId) {
    try {
      let progress = await UserProgress.findOne({ userId, moduleId });
      
      if (!progress) {
        progress = await UserProgress.create({
          userId,
          moduleId,
          status: 'not-started',
        });
      }
      
      return progress;
    } catch (error) {
      throw new Error('Failed to get or create progress');
    }
  }

  // Start a module
  async startModule(userId, moduleId) {
    try {
      const progress = await this.getOrCreateProgress(userId, moduleId);
      
      if (progress.status === 'not-started') {
        progress.markAsStarted();
        progress.isActive = true;
        await progress.save();
        
        // Log module started
        await AuditLog.create({
          userId,
          action: 'module.started',
          category: 'module',
          severity: 'info',
          metadata: {
            moduleId,
          },
        });
      }
      
      return progress;
    } catch (error) {
      throw error;
    }
  }

  // Submit module quiz answers
  async submitModuleQuiz(userId, moduleId, answers, duration = 0) {
    try {
      // Get module with correct answers
      const module = await LearningModule.findOne({ moduleId, isActive: true });
      if (!module) {
        throw new Error('Module not found');
      }
      
      // Get user progress
      const progress = await this.getOrCreateProgress(userId, moduleId);
      
      // Calculate score
      const results = this.calculateQuizResults(module.questions, answers);
      
      // Create attempt data
      const attemptNumber = progress.attempts.length + 1;
      const attemptData = {
        attemptNumber,
        answers: results.answers,
        score: results.score,
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        pointsEarned: results.pointsEarned,
        completedAt: new Date(),
        duration,
      };
      
      // Add attempt to progress
      progress.addAttempt(attemptData);
      
      // Update module completion status
      if (results.score >= 70) { // 70% pass threshold
        progress.markAsCompleted();
      }
      
      // Update time spent
      progress.timeSpent += duration;
      
      // Deactivate module (user completed the attempt)
      progress.isActive = false;
      
      await progress.save();
      
      // Update user total points
      const user = await User.findById(userId);
      await user.addPoints(results.pointsEarned);
      
      // Check for new badges
      const newBadges = await gamificationService.checkAndAwardBadges(userId);
      
      // Log module attempt
      await AuditLog.create({
        userId,
        action: 'module.attempt-submitted',
        category: 'module',
        severity: 'info',
        metadata: {
          moduleId,
          attemptNumber,
          score: results.score,
          pointsEarned: results.pointsEarned,
        },
      });
      
      // If completed, log completion
      if (results.score >= 70 && progress.status === 'completed') {
        await AuditLog.create({
          userId,
          action: 'module.completed',
          category: 'module',
          severity: 'info',
          metadata: {
            moduleId,
            score: results.score,
          },
        });
      }
      
      return {
        attempt: attemptData,
        progress,
        newBadges,
        passed: results.score >= 70,
      };
    } catch (error) {
      throw error;
    }
  }

  // Calculate quiz results
  calculateQuizResults(questions, userAnswers) {
    const results = {
      answers: [],
      totalQuestions: questions.length,
      correctAnswers: 0,
      pointsEarned: 0,
      score: 0,
    };
    
    questions.forEach((question, index) => {
      const userAnswer = userAnswers.find(a => a.questionId === question._id.toString());
      
      if (!userAnswer) {
        results.answers.push({
          questionId: question._id,
          selectedAnswer: -1,
          isCorrect: false,
          pointsEarned: 0,
          timeSpent: 0,
        });
        return;
      }
      
      const isCorrect = userAnswer.selectedAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;
      
      if (isCorrect) {
        results.correctAnswers++;
        results.pointsEarned += pointsEarned;
      }
      
      results.answers.push({
        questionId: question._id,
        selectedAnswer: userAnswer.selectedAnswer,
        isCorrect,
        pointsEarned,
        timeSpent: userAnswer.timeSpent || 0,
      });
    });
    
    // Calculate percentage score
    results.score = Math.round((results.correctAnswers / results.totalQuestions) * 100);
    
    return results;
  }

  // Get user's progress for a specific module
  async getUserModuleProgress(userId, moduleId) {
    try {
      const progress = await UserProgress.findOne({ userId, moduleId });
      return progress;
    } catch (error) {
      throw new Error('Failed to fetch module progress');
    }
  }

  // Get all user's progress
  async getUserAllProgress(userId) {
    try {
      const progress = await UserProgress.find({ userId }).sort({ lastAccessedAt: -1 });
      return progress;
    } catch (error) {
      throw new Error('Failed to fetch user progress');
    }
  }

  // Get user's progress summary
  async getUserProgressSummary(userId) {
    try {
      const allProgress = await UserProgress.find({ userId });
      const user = await User.findById(userId);
      
      const completed = allProgress.filter(p => p.status === 'completed').length;
      const inProgress = allProgress.filter(p => p.status === 'in-progress').length;
      const totalModules = await LearningModule.countDocuments({ isActive: true });
      
      const beginnerCompleted = allProgress.filter(p => 
        p.status === 'completed' && gamificationService.getModuleLevel(p.moduleId) === 'beginner'
      ).length;
      
      const intermediateCompleted = allProgress.filter(p => 
        p.status === 'completed' && gamificationService.getModuleLevel(p.moduleId) === 'intermediate'
      ).length;
      
      const advancedCompleted = allProgress.filter(p => 
        p.status === 'completed' && gamificationService.getModuleLevel(p.moduleId) === 'advanced'
      ).length;
      
      const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
      const averageScore = allProgress.length > 0
        ? Math.round(allProgress.reduce((sum, p) => sum + (p.bestScore || 0), 0) / allProgress.length)
        : 0;
      
      return {
        totalPoints: user.totalPoints,
        currentLevel: user.currentLevel,
        modulesCompleted: completed,
        modulesInProgress: inProgress,
        totalModules,
        completionRate: totalModules > 0 ? Math.round((completed / totalModules) * 100) : 0,
        levelProgress: {
          beginner: beginnerCompleted,
          intermediate: intermediateCompleted,
          advanced: advancedCompleted,
        },
        totalTimeSpent,
        averageScore,
        badgesEarned: user.earnedBadges.length,
      };
    } catch (error) {
      throw new Error('Failed to fetch progress summary');
    }
  }

  // Get active module (currently being taken)
  async getActiveModule(userId) {
    try {
      const activeProgress = await UserProgress.findOne({ userId, isActive: true });
      return activeProgress;
    } catch (error) {
      throw new Error('Failed to fetch active module');
    }
  }

  // Deactivate all active modules (cleanup)
  async deactivateAllModules(userId) {
    try {
      await UserProgress.updateMany(
        { userId, isActive: true },
        { $set: { isActive: false } }
      );
    } catch (error) {
      throw new Error('Failed to deactivate modules');
    }
  }

  // Update last accessed time for a module
  async updateLastAccessed(userId, moduleId) {
    try {
      const progress = await this.getOrCreateProgress(userId, moduleId);
      progress.updateLastAccessed();
      await progress.save();
      return progress;
    } catch (error) {
      throw error;
    }
  }
}

export default new ProgressTrackingService();