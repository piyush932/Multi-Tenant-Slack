import { StatusCodes } from 'http-status-codes';
import { softDeleteWorkspace, restoreWorkspace } from '../services/workspaceLifecycleService.js';

export async function softDeleteHandler(req, res) {
  try {
    await softDeleteWorkspace(req.ctx.workspaceId, req.ctx.userId);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Workspace scheduled for deletion. It can be restored within 30 days.',
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

export async function restoreHandler(req, res) {
  try {
    const workspace = await restoreWorkspace(req.params.workspaceId, req.user.id);
    return res.status(StatusCodes.OK).json({ success: true, data: workspace });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}
