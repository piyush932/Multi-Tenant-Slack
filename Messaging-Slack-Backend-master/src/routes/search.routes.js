import express from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';

const router = express.Router();

router.get(
  '/workspaces/:workspaceId/search',
  isAuthenticated,
  resolveTenantMiddleware,
  searchHandler
);

export default router;
