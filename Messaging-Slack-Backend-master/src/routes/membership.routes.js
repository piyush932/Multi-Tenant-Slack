import express from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';
import requirePermission from '../middlewares/permissionMiddleware.js';
import { changeRoleHandler } from '../controllers/membership.controller.js';

const router = express.Router();

router.patch(
  '/memberships/:id',
  isAuthenticated,
  resolveTenantMiddleware,
  requirePermission('membership:changeRole'),
  changeRoleHandler
);

export default router;
