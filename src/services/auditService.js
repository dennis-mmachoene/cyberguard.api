import AuditLog from '../models/AuditLog.js';

class AuditService {
  // Create audit log entry
  async log(logData) {
    try {
      await AuditLog.create(logData);
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  // Get audit logs for a user
  async getUserLogs(userId, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const logs = await AuditLog.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await AuditLog.countDocuments({ userId });
      
      return {
        logs,
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
      throw new Error('Failed to fetch user logs');
    }
  }

  // Get audit logs by action
  async getLogsByAction(action, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const logs = await AuditLog.find({ action })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await AuditLog.countDocuments({ action });
      
      return {
        logs,
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
      throw new Error('Failed to fetch logs by action');
    }
  }

  // Get audit logs by category
  async getLogsByCategory(category, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const logs = await AuditLog.find({ category })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await AuditLog.countDocuments({ category });
      
      return {
        logs,
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
      throw new Error('Failed to fetch logs by category');
    }
  }

  // Get audit logs by severity
  async getLogsBySeverity(severity, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const logs = await AuditLog.find({ severity })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await AuditLog.countDocuments({ severity });
      
      return {
        logs,
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
      throw new Error('Failed to fetch logs by severity');
    }
  }

  // Get all audit logs (admin only)
  async getAllLogs(filters = {}, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const query = {};
      if (filters.userId) query.userId = filters.userId;
      if (filters.action) query.action = filters.action;
      if (filters.category) query.category = filters.category;
      if (filters.severity) query.severity = filters.severity;
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }
      
      const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email displayName')
        .lean();
      
      const total = await AuditLog.countDocuments(query);
      
      return {
        logs,
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
      throw new Error('Failed to fetch audit logs');
    }
  }

  // Get security-related logs (failed logins, rate limits, suspicious activity)
  async getSecurityLogs(page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const logs = await AuditLog.find({
        category: 'security',
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email displayName')
        .lean();
      
      const total = await AuditLog.countDocuments({ category: 'security' });
      
      return {
        logs,
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
      throw new Error('Failed to fetch security logs');
    }
  }

  // Get statistics for audit logs
  async getAuditStatistics(startDate = null, endDate = null) {
    try {
      const dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }
      
      const totalLogs = await AuditLog.countDocuments(dateFilter);
      
      const categoryBreakdown = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]);
      
      const severityBreakdown = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 },
          },
        },
      ]);
      
      const topActions = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);
      
      return {
        totalLogs,
        categoryBreakdown: categoryBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        severityBreakdown: severityBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topActions: topActions.map(item => ({
          action: item._id,
          count: item.count,
        })),
      };
    } catch (error) {
      throw new Error('Failed to fetch audit statistics');
    }
  }

  // Get recent activity for a user
  async getRecentActivity(userId, limit = 10) {
    try {
      const logs = await AuditLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('action category createdAt metadata')
        .lean();
      
      return logs;
    } catch (error) {
      throw new Error('Failed to fetch recent activity');
    }
  }
}

export default new AuditService();