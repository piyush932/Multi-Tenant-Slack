import express from 'express';

import { searchHandler } from '../controllers/search.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';

const router = express.Router();

router.get(
  '/workspaces/:workspaceId/search',
  authMiddleware,
  resolveTenantMiddleware,
  searchHandler
);

export default router;
