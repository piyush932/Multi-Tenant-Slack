import mongoose from 'mongoose';
import Workspace from '../schema/workspace.js';
import {
  createInvite,
  findValidInviteByToken,
  markInviteAccepted,
} from '../repositories/inviteRepository.js';
import { createOwnerMembership } from '../repositories/membershipRepository.js';
import Membership from '../schema/membership.js';
import { recordAuditLog } from './auditLogService.js';
import { addEmailtoMailQueue } from '../producers/mailQueueProducer.js';
import { APP_LINK } from '../config/serverConfig.js';

export async function inviteMember(workspaceId, email, role, actorId) {
  const invite = await createInvite(workspaceId, email, role);

  const workspace = await Workspace.findById(workspaceId);
  await addEmailtoMailQueue({
    to: email,
    subject: `You're invited to join ${workspace?.name || 'a workspace'} on Multi-Tenant Slack`,
    html: `
      <p>You've been invited to join <strong>${workspace?.name || 'a workspace'}</strong> as a <strong>${role}</strong>.</p>
      <p>Click the link below to accept (valid for 7 days):</p>
      <p><a href="${APP_LINK}/invites/${invite.token}/accept">${APP_LINK}/invites/${invite.token}/accept</a></p>
      <p>If the link doesn't work, use this token directly: <code>${invite.token}</code></p>
    `,
  });

  await recordAuditLog({
    workspaceId,
    actorId,
    action: 'invite.created',
    targetType: 'Invite',
    targetId: invite._id,
    metadata: { email, role },
  });
  return invite;
}

export async function acceptInvite(token, userId) {
  const invite = await findValidInviteByToken(token);
  if (!invite) {
    throw Object.assign(new Error('Invite not found or expired'), {
      statusCode: 404,
    });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const accepted = await markInviteAccepted(invite._id);
    if (!accepted) {
      throw Object.assign(new Error('Invite already used'), {
        statusCode: 409,
      });
    }

    const membership = await Membership.findOneAndUpdate(
      { workspaceId: invite.workspaceId, userId },
      { $setOnInsert: { role: invite.role } },
      { upsert: true, new: true, session }
    );

    await session.commitTransaction();

    await recordAuditLog({
      workspaceId: invite.workspaceId,
      actorId: userId,
      action: 'invite.accepted',
      targetType: 'Membership',
      targetId: membership._id,
      metadata: { role: invite.role },
    });

    return membership;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function createWorkspaceWithOwner(name, slug, ownerId) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const [workspace] = await Workspace.create([{ name, slug }], { session });
    await createOwnerMembership(workspace._id, ownerId, session);
    await session.commitTransaction();

    await recordAuditLog({
      workspaceId: workspace._id,
      actorId: ownerId,
      action: 'workspace.created',
      targetType: 'Workspace',
      targetId: workspace._id,
      metadata: { name },
    });

    return workspace;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
