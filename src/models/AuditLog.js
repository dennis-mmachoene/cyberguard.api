import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'auth.login',
        'auth.logout',
        'auth.login-failed',
        'auth.account-locked',
        'auth.password-changed',
        'user.profile-updated',
        'user.account-suspended',
        'user.account-activated',
        'module.started',
        'module.completed',
        'module.attempt-submitted',
        'badge.earned',
        'admin.module-created',
        'admin.module-updated',
        'admin.module-deleted',
        'admin.badge-created',
        'admin.badge-updated',
        'admin.user-suspended',
        'admin.user-activated',
        'chatbot.query',
        'chatbot.blocked-during-challenge',
        'ai.content-generated',
        'ai.request-blocked',
        'security.rate-limit-exceeded',
        'security.suspicious-activity',
      ],
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['auth', 'user', 'module', 'badge', 'admin', 'chatbot', 'ai', 'security'],
      index: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info',
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      moduleId: String,
      badgeId: String,
      attemptNumber: Number,
      score: Number,
      pointsEarned: Number,
      targetUserId: mongoose.Schema.Types.ObjectId,
      query: String,
      blocked: Boolean,
      reason: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// TTL index to auto-delete old logs (optional - can be configured based on retention policy)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;