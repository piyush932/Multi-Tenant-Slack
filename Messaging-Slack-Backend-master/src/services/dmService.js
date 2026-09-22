import DmMessage from '../schema/dmMessage.js';

export async function getDmMessages(workspaceId, userA, userB, { page = 1, limit = 30 } = {}) {
  const messages = await DmMessage.find({
    workspaceId,
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA },
    ],
  })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return messages;
}

export async function sendDmMessage(workspaceId, senderId, receiverId, body) {
  if (!body || !body.trim()) {
    throw Object.assign(new Error('Message body is required'), { statusCode: 400 });
  }
  return DmMessage.create({ workspaceId, senderId, receiverId, body });
}
