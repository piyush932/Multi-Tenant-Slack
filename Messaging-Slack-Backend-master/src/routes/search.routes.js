import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';
import { searchHandler } from '../controllers/search.controller.js';

const router = express.Router();

router.get(
  '/workspaces/:workspaceId/search',
  authMiddleware,
  resolveTenantMiddleware,
  searchHandler
);

export default router;
