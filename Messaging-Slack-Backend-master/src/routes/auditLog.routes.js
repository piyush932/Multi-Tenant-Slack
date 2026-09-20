import express from 'express';

import { listAuditLogHandler } from '../controllers/auditLog.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requirePermission from '../middlewares/permissionMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';

const router = express.Router();

router.get(
  '/workspaces/:workspaceId/audit-log',
  authMiddleware,
  resolveTenantMiddleware,
  requirePermission('membership:invite'),
  listAuditLogHandler
);

export default router;
