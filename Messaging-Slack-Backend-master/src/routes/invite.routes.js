import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';
import requirePermission from '../middlewares/permissionMiddleware.js';
import {
  createInviteHandler,
  acceptInviteHandler,
} from '../controllers/invite.controller.js';

const router = express.Router();

router.post(
  '/workspaces/:workspaceId/invites',
  authMiddleware,
  resolveTenantMiddleware,
  requirePermission('membership:invite'),
  createInviteHandler
);

router.post('/invites/:token/accept', authMiddleware, acceptInviteHandler);

export default router;
