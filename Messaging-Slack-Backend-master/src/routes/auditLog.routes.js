import express from 'express';

import { listAuditLogHandler } from '../controllers/auditLog.controller.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import requirePermission from '../middlewares/permissionMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';

const router = express.Router();

router.get(
  '/workspaces/:workspaceId/audit-log',
  isAuthenticated,
  resolveTenantMiddleware,
  requirePermission('membership:invite'),
  listAuditLogHandler
);

export default router;
