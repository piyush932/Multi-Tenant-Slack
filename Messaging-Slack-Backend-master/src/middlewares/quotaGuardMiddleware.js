import Membership from '../schema/membership.js';
import Channel from '../schema/channel.js';
import Workspace from '../schema/workspace.js';
import { assertUnderLimit } from '../services/planQuotaService.js';

export function enforceMemberQuota() {
  return async (req, res, next) => {
    try {
      const workspace = await Workspace.findById(req.ctx.workspaceId);
      const currentCount = await Membership.countDocuments({ workspaceId: req.ctx.workspaceId });
      assertUnderLimit(currentCount, workspace.plan || 'free', 'maxMembers', 'Member');
      next();
    } catch (err) {
      return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  };
}

export function enforceChannelQuota() {
  return async (req, res, next) => {
    try {
      const workspace = await Workspace.findById(req.ctx.workspaceId);
      const currentCount = await Channel.countDocuments({ workspaceId: req.ctx.workspaceId });
      assertUnderLimit(currentCount, workspace.plan || 'free', 'maxChannels', 'Channel');
      next();
    } catch (err) {
      return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  };
}
