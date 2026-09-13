import express from 'express';
import channelRoutes from './channel.js';
import membersRoutes from './members.js';
import messagesRoutes from './messages.js';
import paymentRoutes from './payment.js';
import usersRoutes from './users.js';
import workspacesRoutes from './workspaces.js';
import inviteRoutes from './invite.routes.js';
import membershipRoutes from './membership.routes.js';

const router = express.Router();

router.use('/channels', channelRoutes);
router.use('/members', membersRoutes);
router.use('/messages', messagesRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', usersRoutes);
router.use('/workspaces', workspacesRoutes);

// NEW: Invite & Membership routes (tenant isolation extension)
router.use('/', inviteRoutes);
router.use('/', membershipRoutes);

export default router;
