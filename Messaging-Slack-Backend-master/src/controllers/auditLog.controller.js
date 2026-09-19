import { StatusCodes } from 'http-status-codes';
import { listAuditLogs } from '../services/auditLogService.js';

export async function listAuditLogHandler(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const logs = await listAuditLogs(req.ctx.workspaceId, { page, limit });
    return res.status(StatusCodes.OK).json({ success: true, data: logs });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}
