import express from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';
import { searchHandler } from '../controllers/search.controller.js';

const router = express.Router();

router.get(
  '/workspaces/:workspaceId/search',
  isAuthenticated,
  resolveTenantMiddleware,
  searchHandler
);

export default router;
