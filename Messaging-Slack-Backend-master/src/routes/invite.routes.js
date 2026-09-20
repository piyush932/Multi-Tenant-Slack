import express from 'express';

import {
  acceptInviteHandler,
  createInviteHandler,
} from '../controllers/invite.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requirePermission from '../middlewares/permissionMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';
import tenantRateLimit from '../middlewares/tenantRateLimitMiddleware.js';

const router = express.Router();

router.post(
  '/workspaces/:workspaceId/invites',
  authMiddleware,
  resolveTenantMiddleware,
  requirePermission('membership:invite'),
  tenantRateLimit({ windowSeconds: 60, maxRequests: 20 }),
  createInviteHandler
);

router.post('/invites/:token/accept', authMiddleware, acceptInviteHandler);

export default router;
