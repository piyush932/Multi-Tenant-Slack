import { StatusCodes } from 'http-status-codes';
import Message from '../schema/message.js';
import { forTenant } from '../repositories/tenantScopedRepository.js';

export async function getMessage(req, res) {
  try {
    const message = await forTenant(req.ctx).findById(Message, req.params.id);
    if (!message) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Message not found' });
    }
    return res.status(StatusCodes.OK).json({ success: true, data: message });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}

export async function createMessage(req, res) {
  try {
    const { body, image, channelId, senderId } = req.body;
    const message = await forTenant(req.ctx).create(Message, {
      body,
      image,
      channelId,
      senderId,
    });
    return res.status(StatusCodes.CREATED).json({ success: true, data: message });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}

export async function listMessages(req, res) {
  try {
    const messages = await forTenant(req.ctx).find(Message, {
      channelId: req.params.channelId,
    });
    return res.status(StatusCodes.OK).json({ success: true, data: messages });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}
