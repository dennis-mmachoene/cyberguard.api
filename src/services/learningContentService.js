import LearningModule from '../models/LearningModule.js';
import aiService from './aiService.js';

class LearningContentService {
  // Get all modules by level
  async getModulesByLevel(level) {
    try {
      const modules = await LearningModule.find({
        level,
        isActive: true,
      }).sort({ order: 1 }).select('-questions.correctAnswer');
      
      return modules;
    } catch (error) {
      throw new Error('Failed to fetch modules');
    }
  }

  // Get single module by ID (without correct answers)
  async getModuleById(moduleId, includeAnswers = false) {
    try {
      const selectFields = includeAnswers ? '' : '-questions.correctAnswer';
      const module = await LearningModule.findOne({
        moduleId,
        isActive: true,
      }).select(selectFields);
      
      if (!module) {
        throw new Error('Module not found');
      }
      
      return module;
    } catch (error) {
      throw error;
    }
  }

  // Get module with answers (for submission validation)
  async getModuleWithAnswers(moduleId) {
    return await this.getModuleById(moduleId, true);
  }

  // Get all active modules
  async getAllModules() {
    try {
      const modules = await LearningModule.find({
        isActive: true,
      }).sort({ level: 1, order: 1 }).select('-questions.correctAnswer');
      
      return modules;
    } catch (error) {
      throw new Error('Failed to fetch modules');
    }
  }

  // Get modules count by level
  async getModulesCountByLevel(level) {
    try {
      const count = await LearningModule.countDocuments({
        level,
        isActive: true,
      });
      
      return count;
    } catch (error) {
      throw new Error('Failed to count modules');
    }
  }

  // Get total modules count
  async getTotalModulesCount() {
    try {
      const count = await LearningModule.countDocuments({
        isActive: true,
      });
      
      return count;
    } catch (error) {
      throw new Error('Failed to count modules');
    }
  }

  // Get module questions for quiz
  async getModuleQuestions(moduleId) {
    try {
      const module = await LearningModule.findOne({
        moduleId,
        isActive: true,
      }).select('questions -questions.correctAnswer');
      
      if (!module) {
        throw new Error('Module not found');
      }
      
      return module.questions;
    } catch (error) {
      throw error;
    }
  }

  // Enhance module content with AI (only extends, never modifies base data)
  async enhanceModuleContent(moduleId, sectionTitle, userId) {
    try {
      const module = await this.getModuleById(moduleId);
      
      const section = module.content.sections.find(s => s.title === sectionTitle);
      if (!section) {
        throw new Error('Section not found');
      }
      
      // Generate additional explanation using AI
      const aiResult = await aiService.generateContentExplanation(
        sectionTitle,
        section.content.substring(0, 200), // Context
        userId
      );
      
      if (!aiResult.success) {
        return {
          original: section.content,
          enhanced: null,
        };
      }
      
      return {
        original: section.content,
        enhanced: aiResult.content,
      };
    } catch (error) {
      throw error;
    }
  }

  // Search modules by tags or title
  async searchModules(query) {
    try {
      const searchRegex = new RegExp(query, 'i');
      
      const modules = await LearningModule.find({
        isActive: true,
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
        ],
      }).sort({ level: 1, order: 1 }).select('-questions.correctAnswer');
      
      return modules;
    } catch (error) {
      throw new Error('Failed to search modules');
    }
  }

  // Get learning objectives for all modules
  async getAllLearningObjectives() {
    try {
      const modules = await LearningModule.find({
        isActive: true,
      }).sort({ level: 1, order: 1 }).select('moduleId title level learningObjectives');
      
      return modules.map(module => ({
        moduleId: module.moduleId,
        title: module.title,
        level: module.level,
        objectives: module.learningObjectives,
      }));
    } catch (error) {
      throw new Error('Failed to fetch learning objectives');
    }
  }
}

export default new LearningContentService();