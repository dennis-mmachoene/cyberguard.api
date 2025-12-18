import leaderboardService from '../services/leaderboardService.js';
import { formatSuccessResponse, formatPaginatedResponse, formatErrorResponse } from '../utils/responseFormatter.js';

// Get global leaderboard
export const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    
    const result = await leaderboardService.getGlobalLeaderboard(page, limit);
    
    return res.status(200).json(
      formatPaginatedResponse(
        result.entries,
        result.pagination,
        'Global leaderboard fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get leaderboard by level
export const getLevelLeaderboard = async (req, res, next) => {
  try {
    const { level } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    
    if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
      return res.status(400).json(
        formatErrorResponse('Invalid level', 'INVALID_LEVEL')
      );
    }
    
    const result = await leaderboardService.getLevelLeaderboard(level, page, limit);
    
    return res.status(200).json(
      formatPaginatedResponse(
        result.entries,
        result.pagination,
        `${level} leaderboard fetched successfully`
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get user's leaderboard entry
export const getUserLeaderboardEntry = async (req, res, next) => {
  try {
    const entry = await leaderboardService.getUserLeaderboardEntry(req.user._id);
    
    return res.status(200).json(
      formatSuccessResponse(
        { entry },
        'User leaderboard entry fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get user's rank
export const getUserRank = async (req, res, next) => {
  try {
    const rank = await leaderboardService.getUserRank(req.user._id);
    
    if (!rank) {
      return res.status(404).json(
        formatErrorResponse('Rank not found', 'RANK_NOT_FOUND')
      );
    }
    
    return res.status(200).json(
      formatSuccessResponse({ rank }, 'User rank fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get top performers
export const getTopPerformers = async (req, res, next) => {
  try {
    const topPerformers = await leaderboardService.getTopPerformers();
    
    return res.status(200).json(
      formatSuccessResponse(
        { topPerformers },
        'Top performers fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get users near user's rank
export const getUsersNearRank = async (req, res, next) => {
  try {
    const rank = await leaderboardService.getUserRank(req.user._id);
    
    if (!rank) {
      return res.status(404).json(
        formatErrorResponse('Rank not found', 'RANK_NOT_FOUND')
      );
    }
    
    const range = parseInt(req.query.range, 10) || 5;
    const users = await leaderboardService.getUsersNearRank(rank.rank, range);
    
    return res.status(200).json(
      formatSuccessResponse(
        { users, userRank: rank.rank },
        'Users near rank fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get leaderboard statistics
export const getLeaderboardStats = async (req, res, next) => {
  try {
    const stats = await leaderboardService.getLeaderboardStats();
    
    return res.status(200).json(
      formatSuccessResponse(
        { stats },
        'Leaderboard statistics fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};