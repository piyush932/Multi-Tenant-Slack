import express from 'express';

import auditLogRoutes from '../auditLog.routes.js';
import inviteRoutes from '../invite.routes.js';
import membershipRoutes from '../membership.routes.js';
import searchRoutes from '../search.routes.js';
import channelRouter from './channel.js';
import memberRouter from './members.js';
import messageRouter from './messages.js';
import paymentRouter from './payment.js';
import userRouter from './users.js';
import workspaceRouter from './workspaces.js';

const router = express.Router();

router.use('/users', userRouter);

router.use('/workspaces', workspaceRouter);

router.use('/channels', channelRouter);

router.use('/members', memberRouter);

router.use('/messages', messageRouter);

router.use('/payments', paymentRouter);

router.use('/', inviteRoutes);

router.use('/', membershipRoutes);

router.use('/', auditLogRoutes);

router.use('/', searchRoutes);

export default router;
