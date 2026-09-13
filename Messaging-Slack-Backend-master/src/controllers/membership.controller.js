import { StatusCodes } from 'http-status-codes';
import { changeRole } from '../services/membershipService.js';

export async function changeRoleHandler(req, res) {
  try {
    const { role } = req.body;
    const updated = await changeRole(
      req.ctx.workspaceId,
      req.params.id,
      role,
      req.ctx.userId
    );
    return res.status(StatusCodes.OK).json({ success: true, data: updated });
  } catch (err) {
    return res
      .status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}
