import express from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import resolveTenantMiddleware from '../middlewares/resolveTenantMiddleware.js';
import { getDmMessagesHandler, sendDmMessageHandler } from '../controllers/dm.controller.js';

const router = express.Router();

router.get('/workspaces/:workspaceId/dms/:memberId', isAuthenticated, resolveTenantMiddleware, getDmMessagesHandler);
router.post('/workspaces/:workspaceId/dms/:memberId', isAuthenticated, resolveTenantMiddleware, sendDmMessageHandler);

export default router;
