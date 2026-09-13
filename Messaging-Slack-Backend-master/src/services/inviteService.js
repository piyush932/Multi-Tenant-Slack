import mongoose from 'mongoose';
import Workspace from '../schema/workspace.js';
import {
  createInvite,
  findValidInviteByToken,
  markInviteAccepted,
} from '../repositories/inviteRepository.js';
import { createOwnerMembership } from '../repositories/membershipRepository.js';
import Membership from '../schema/membership.js';

export async function inviteMember(workspaceId, email, role) {
  return createInvite(workspaceId, email, role);
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
    return workspace;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
