import express from 'express';
import {
  getAllUsers,
  suspendUser,
  activateUser,
  createModule,
  updateModule,
  deleteModule,
  createBadge,
  updateBadge,
  getAuditLogs,
  getSecurityLogs,
  getAuditStatistics,
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  validatePagination,
  validateCreateModule,
  validateCreateBadge,
  validateMongoId,
  validateModuleId,
} from '../middleware/validation.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { sanitizeAll } from '../middleware/sanitization.js';

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);
router.use(adminLimiter);
router.use(sanitizeAll);

// User management
router.get('/users', validatePagination, getAllUsers);
router.post('/users/:userId/suspend', validateMongoId('userId'), suspendUser);
router.post('/users/:userId/activate', validateMongoId('userId'), activateUser);

// Module management
router.post('/modules', validateCreateModule, createModule);
router.put('/modules/:moduleId', validateModuleId, updateModule);
router.delete('/modules/:moduleId', validateModuleId, deleteModule);

// Badge management
router.post('/badges', validateCreateBadge, createBadge);
router.put('/badges/:badgeId', updateBadge);

// Audit logs
router.get('/audit/logs', validatePagination, getAuditLogs);
router.get('/audit/security', validatePagination, getSecurityLogs);
router.get('/audit/statistics', getAuditStatistics);

export default router;