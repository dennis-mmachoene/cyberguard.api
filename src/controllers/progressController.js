import progressTrackingService from '../services/progressTrackingService.js';
import leaderboardService from '../services/leaderboardService.js';
import { formatSuccessResponse, formatErrorResponse } from '../utils/responseFormatter.js';

// Start a module
export const startModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    
    // Check if user has an active module
    const activeModule = await progressTrackingService.getActiveModule(req.user._id);
    
    if (activeModule && activeModule.moduleId !== moduleId) {
      return res.status(400).json(
        formatErrorResponse(
          'Please complete or exit your current module before starting a new one',
          'ACTIVE_MODULE_EXISTS'
        )
      );
    }
    
    const progress = await progressTrackingService.startModule(req.user._id, moduleId);
    
    return res.status(200).json(
      formatSuccessResponse({ progress }, 'Module started successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Submit module quiz
export const submitModuleQuiz = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { answers, duration } = req.body;
    
    const result = await progressTrackingService.submitModuleQuiz(
      req.user._id,
      moduleId,
      answers,
      duration
    );
    
    // Update leaderboard
    await leaderboardService.updateLeaderboardEntry(req.user._id);
    
    return res.status(200).json(
      formatSuccessResponse(
        {
          attempt: result.attempt,
          progress: result.progress,
          newBadges: result.newBadges,
          passed: result.passed,
        },
        result.passed ? 'Quiz submitted successfully. Module completed!' : 'Quiz submitted successfully'
      )
    );
  } catch (error) {
    if (error.message === 'Module not found') {
      return res.status(404).json(
        formatErrorResponse('Module not found', 'MODULE_NOT_FOUND')
      );
    }
    next(error);
  }
};

// Get user's progress for a module
export const getModuleProgress = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    
    const progress = await progressTrackingService.getUserModuleProgress(
      req.user._id,
      moduleId
    );
    
    if (!progress) {
      return res.status(404).json(
        formatErrorResponse('Progress not found', 'PROGRESS_NOT_FOUND')
      );
    }
    
    return res.status(200).json(
      formatSuccessResponse({ progress }, 'Progress fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get all user's progress
export const getAllProgress = async (req, res, next) => {
  try {
    const progress = await progressTrackingService.getUserAllProgress(req.user._id);
    
    return res.status(200).json(
      formatSuccessResponse({ progress }, 'All progress fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get user's progress summary
export const getProgressSummary = async (req, res, next) => {
  try {
    const summary = await progressTrackingService.getUserProgressSummary(req.user._id);
    
    return res.status(200).json(
      formatSuccessResponse({ summary }, 'Progress summary fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get active module
export const getActiveModule = async (req, res, next) => {
  try {
    const activeModule = await progressTrackingService.getActiveModule(req.user._id);
    
    if (!activeModule) {
      return res.status(404).json(
        formatErrorResponse('No active module', 'NO_ACTIVE_MODULE')
      );
    }
    
    return res.status(200).json(
      formatSuccessResponse({ activeModule }, 'Active module fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Exit active module (deactivate without submitting)
export const exitActiveModule = async (req, res, next) => {
  try {
    await progressTrackingService.deactivateAllModules(req.user._id);
    
    return res.status(200).json(
      formatSuccessResponse(null, 'Module exited successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update last accessed time
export const updateLastAccessed = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    
    const progress = await progressTrackingService.updateLastAccessed(
      req.user._id,
      moduleId
    );
    
    return res.status(200).json(
      formatSuccessResponse({ progress }, 'Last accessed updated')
    );
  } catch (error) {
    next(error);
  }
};