import jwt from 'jsonwebtoken';
import Workspace from '../schema/workspace.js';
import Membership from '../schema/membership.js';

async function resolveTenantMiddleware(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let workspaceSlug = req.user?.workspaceSlug;
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0];
    if (!workspaceSlug && subdomain && !['www', 'app', 'api'].includes(subdomain)) {
      workspaceSlug = subdomain;
    }
    const workspaceIdParam = req.params.workspaceId;

    const workspace = workspaceIdParam
      ? await Workspace.findById(workspaceIdParam)
      : await Workspace.findOne({ slug: workspaceSlug });

    if (!workspace) {
      return res.status(404).json({ message: 'Not found' });
    }

    const membership = await Membership.findOne({
      workspaceId: workspace._id,
      userId,
    });
    if (!membership) {
      return res.status(404).json({ message: 'Not found' });
    }

    req.ctx = {
      workspaceId: String(workspace._id),
      userId: String(userId),
      role: membership.role,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid workspace context' });
  }
}

export default resolveTenantMiddleware;
