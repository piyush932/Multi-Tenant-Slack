import { StatusCodes } from 'http-status-codes';
import Channel from '../schema/channel.js';
import { forTenant } from '../repositories/tenantScopedRepository.js';

export async function getChannel(req, res) {
  try {
    const channel = await forTenant(req.ctx).findById(Channel, req.params.id);
    if (!channel) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Channel not found' });
    }
    return res.status(StatusCodes.OK).json({ success: true, data: channel });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}

export async function createChannel(req, res) {
  try {
    const { name } = req.body;
    const channel = await forTenant(req.ctx).create(Channel, { name });
    return res.status(StatusCodes.CREATED).json({ success: true, data: channel });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}

export async function listChannels(req, res) {
  try {
    const channels = await forTenant(req.ctx).find(Channel, {});
    return res.status(StatusCodes.OK).json({ success: true, data: channels });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}
