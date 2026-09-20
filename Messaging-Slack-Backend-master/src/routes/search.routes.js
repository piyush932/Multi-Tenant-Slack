import express from 'express';

import { searchHandler } from '../controllers/search.controller.js';
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
