import { StatusCodes } from 'http-status-codes';
import { getDmMessages, sendDmMessage } from '../services/dmService.js';

export async function getDmMessagesHandler(req, res) {
  try {
    const messages = await getDmMessages(
      req.ctx.workspaceId,
      req.ctx.userId,
      req.params.memberId,
      { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 30 }
    );
    return res.status(StatusCodes.OK).json({ success: true, data: messages });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

export async function sendDmMessageHandler(req, res) {
  try {
    const message = await sendDmMessage(
      req.ctx.workspaceId,
      req.ctx.userId,
      req.params.memberId,
      req.body.body
    );
    return res.status(StatusCodes.CREATED).json({ success: true, data: message });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}
