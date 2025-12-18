import LearningModule from '../models/LearningModule.js';
import Badge from '../models/Badge.js';
import User from '../models/User.js';
import auditService from '../services/auditService.js';
import { formatSuccessResponse, formatErrorResponse, formatPaginatedResponse } from '../utils/responseFormatter.js';
import AuditLog from '../models/AuditLog.js';

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await User.countDocuments();
    
    return res.status(200).json(
      formatPaginatedResponse(
        users,
        {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        'Users fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Suspend user account
export const suspendUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 'USER_NOT_FOUND')
      );
    }
    
    if (user.role === 'admin') {
      return res.status(403).json(
        formatErrorResponse('Cannot suspend admin users', 'FORBIDDEN')
      );
    }
    
    user.isActive = false;
    await user.save();
    
    // Log suspension
    await AuditLog.create({
      userId: req.user._id,
      action: 'admin.user-suspended',
      category: 'admin',
      severity: 'warning',
      metadata: {
        targetUserId: userId,
      },
    });
    
    return res.status(200).json(
      formatSuccessResponse(
        { user: user.toJSON() },
        'User suspended successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Activate user account
export const activateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 'USER_NOT_FOUND')
      );
    }
    
    user.isActive = true;
    await user.save();
    
    // Log activation
    await AuditLog.create({
      userId: req.user._id,
      action: 'admin.user-activated',
      category: 'admin',
      severity: 'info',
      metadata: {
        targetUserId: userId,
      },
    });
    
    return res.status(200).json(
      formatSuccessResponse(
        { user: user.toJSON() },
        'User activated successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Create learning module
export const createModule = async (req, res, next) => {
  try {
    const moduleData = req.body;
    
    // Check if module already exists
    const existingModule = await LearningModule.findOne({ moduleId: moduleData.moduleId });
    if (existingModule) {
      return res.status(409).json(
        formatErrorResponse('Module with this ID already exists', 'MODULE_EXISTS')
      );
    }
    
    const module = await LearningModule.create(moduleData);
    
    // Log module creation
    await AuditLog.create({
      userId: req.user._id,
      action: 'admin.module-created',
      category: 'admin',
      severity: 'info',
      metadata: {
        moduleId: module.moduleId,
      },
    });
    
    return res.status(201).json(
      formatSuccessResponse(
        { module },
        'Module created successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Update learning module
export const updateModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const updateData = req.body;
    
    const module = await LearningModule.findOneAndUpdate(
      { moduleId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!module) {
      return res.status(404).json(
        formatErrorResponse('Module not found', 'MODULE_NOT_FOUND')
      );
    }
    
    // Log module update
    await AuditLog.create({
      userId: req.user._id,
      action: 'admin.module-updated',
      category: 'admin',
      severity: 'info',
      metadata: {
        moduleId: module.moduleId,
      },
    });
    
    return res.status(200).json(
      formatSuccessResponse(
        { module },
        'Module updated successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Delete learning module
export const deleteModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    
    const module = await LearningModule.findOneAndDelete({ moduleId });
    
    if (!module) {
      return res.status(404).json(
        formatErrorResponse('Module not found', 'MODULE_NOT_FOUND')
      );
    }
    
    // Log module deletion
    await AuditLog.create({
      userId: req.user._id,
      action: 'admin.module-deleted',
      category: 'admin',
      severity: 'warning',
      metadata: {
        moduleId,
      },
    });
    
    return res.status(200).json(
      formatSuccessResponse(null, 'Module deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Create badge
export const createBadge = async (req, res, next) => {
  try {
    const badgeData = req.body;
    
    // Check if badge already exists
    const existingBadge = await Badge.findOne({ badgeId: badgeData.badgeId });
    if (existingBadge) {
      return res.status(409).json(
        formatErrorResponse('Badge with this ID already exists', 'BADGE_EXISTS')
      );
    }
    
    const badge = await Badge.create(badgeData);
    
    // Log badge creation
    await AuditLog.create({
      userId: req.user._id,
      action: 'admin.badge-created',
      category: 'admin',
      severity: 'info',
      metadata: {
        badgeId: badge.badgeId,
      },
    });
    
    return res.status(201).json(
      formatSuccessResponse(
        { badge },
        'Badge created successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Update badge
export const updateBadge = async (req, res, next) => {
  try {
    const { badgeId } = req.params;
    const updateData = req.body;
    
    const badge = await Badge.findOneAndUpdate(
      { badgeId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!badge) {
      return res.status(404).json(
        formatErrorResponse('Badge not found', 'BADGE_NOT_FOUND')
      );
    }
    
    // Log badge update
    await AuditLog.create({
      userId: req.user._id,
      action: 'admin.badge-updated',
      category: 'admin',
      severity: 'info',
      metadata: {
        badgeId: badge.badgeId,
      },
    });
    
    return res.status(200).json(
      formatSuccessResponse(
        { badge },
        'Badge updated successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get all audit logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    
    const filters = {
      userId: req.query.userId,
      action: req.query.action,
      category: req.query.category,
      severity: req.query.severity,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    
    const result = await auditService.getAllLogs(filters, page, limit);
    
    return res.status(200).json(
      formatPaginatedResponse(
        result.logs,
        result.pagination,
        'Audit logs fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get security logs
export const getSecurityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    
    const result = await auditService.getSecurityLogs(page, limit);
    
    return res.status(200).json(
      formatPaginatedResponse(
        result.logs,
        result.pagination,
        'Security logs fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get audit statistics
export const getAuditStatistics = async (req, res, next) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const stats = await auditService.getAuditStatistics(startDate, endDate);
    
    return res.status(200).json(
      formatSuccessResponse(
        { stats },
        'Audit statistics fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};