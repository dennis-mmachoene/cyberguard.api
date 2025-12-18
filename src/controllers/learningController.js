import learningContentService from '../services/learningContentService.js';
import { formatSuccessResponse, formatErrorResponse, formatListResponse } from '../utils/responseFormatter.js';

// Get all modules
export const getAllModules = async (req, res, next) => {
  try {
    const modules = await learningContentService.getAllModules();
    
    return res.status(200).json(
      formatListResponse(modules, 'Modules fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get modules by level
export const getModulesByLevel = async (req, res, next) => {
  try {
    const { level } = req.params;
    
    if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
      return res.status(400).json(
        formatErrorResponse('Invalid level', 'INVALID_LEVEL')
      );
    }
    
    const modules = await learningContentService.getModulesByLevel(level);
    
    return res.status(200).json(
      formatListResponse(modules, `${level} modules fetched successfully`)
    );
  } catch (error) {
    next(error);
  }
};

// Get single module by ID
export const getModuleById = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    
    const module = await learningContentService.getModuleById(moduleId);
    
    if (!module) {
      return res.status(404).json(
        formatErrorResponse('Module not found', 'MODULE_NOT_FOUND')
      );
    }
    
    return res.status(200).json(
      formatSuccessResponse({ module }, 'Module fetched successfully')
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

// Get module questions
export const getModuleQuestions = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    
    const questions = await learningContentService.getModuleQuestions(moduleId);
    
    return res.status(200).json(
      formatSuccessResponse(
        { questions },
        'Module questions fetched successfully'
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

// Enhance module content with AI
export const enhanceModuleContent = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { sectionTitle } = req.body;
    
    if (!sectionTitle) {
      return res.status(400).json(
        formatErrorResponse('Section title is required', 'MISSING_SECTION_TITLE')
      );
    }
    
    const result = await learningContentService.enhanceModuleContent(
      moduleId,
      sectionTitle,
      req.user._id
    );
    
    return res.status(200).json(
      formatSuccessResponse(
        result,
        'Content enhancement generated successfully'
      )
    );
  } catch (error) {
    if (error.message === 'Module not found' || error.message === 'Section not found') {
      return res.status(404).json(
        formatErrorResponse(error.message, 'NOT_FOUND')
      );
    }
    next(error);
  }
};

// Search modules
export const searchModules = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json(
        formatErrorResponse('Search query is required', 'MISSING_QUERY')
      );
    }
    
    const modules = await learningContentService.searchModules(q);
    
    return res.status(200).json(
      formatListResponse(modules, 'Search results fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get all learning objectives
export const getLearningObjectives = async (req, res, next) => {
  try {
    const objectives = await learningContentService.getAllLearningObjectives();
    
    return res.status(200).json(
      formatListResponse(objectives, 'Learning objectives fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};