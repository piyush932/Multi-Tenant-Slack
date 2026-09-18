import express from 'express';

import { changeRoleHandler } from '../controllers/membership.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requirePermission from '../middlewares/permissionMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';

const router = express.Router();

router.patch(
  '/memberships/:id',
  authMiddleware,
  resolveTenantMiddleware,
  requirePermission('membership:changeRole'),
  changeRoleHandler
);

export default router;
