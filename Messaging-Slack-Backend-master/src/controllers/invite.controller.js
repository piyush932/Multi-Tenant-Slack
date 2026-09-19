import { StatusCodes } from 'http-status-codes';
import { inviteMember, acceptInvite } from '../services/inviteService.js';

export async function createInviteHandler(req, res) {
  try {
    const { email, role } = req.body;
    const invite = await inviteMember(req.ctx.workspaceId, email, role, req.ctx.userId);
    return res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        token: invite.token,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (err) {
    return res
      .status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}

export async function acceptInviteHandler(req, res) {
  try {
    const membership = await acceptInvite(req.params.token, req.user.id);
    return res.status(StatusCodes.OK).json({ success: true, data: membership });
  } catch (err) {
    return res
      .status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}
