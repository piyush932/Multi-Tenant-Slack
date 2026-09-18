import crypto from 'crypto';

import Invite from '../schema/invite.js';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function createInvite(workspaceId, email, role) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  return Invite.create({ workspaceId, email, role, token, expiresAt });
}

export async function findValidInviteByToken(token) {
  return Invite.findOne({
    token,
    acceptedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

export async function markInviteAccepted(inviteId) {
  return Invite.findOneAndUpdate(
    { _id: inviteId, acceptedAt: null },
    { acceptedAt: new Date() },
    { new: true }
  );
}
