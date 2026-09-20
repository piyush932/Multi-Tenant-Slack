import express from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';
import requirePermission from '../middlewares/permissionMiddleware.js';
import tenantRateLimit from '../middlewares/tenantRateLimitMiddleware.js';
import {
  createInviteHandler,
  acceptInviteHandler,
} from '../controllers/invite.controller.js';

const router = express.Router();

router.post(
  '/workspaces/:workspaceId/invites',
  isAuthenticated,
  resolveTenantMiddleware,
  requirePermission('membership:invite'),
  tenantRateLimit({ windowSeconds: 60, maxRequests: 20 }),
  createInviteHandler
);

router.post('/invites/:token/accept', isAuthenticated, acceptInviteHandler);

export default router;
