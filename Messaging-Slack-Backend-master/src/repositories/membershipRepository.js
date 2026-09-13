import Membership from '../schema/membership.js';

export async function createOwnerMembership(workspaceId, userId, session) {
  return Membership.create(
    [{ workspaceId, userId, role: 'owner' }],
    session ? { session } : {}
  );
}

export async function findMembership(workspaceId, userId) {
  return Membership.findOne({ workspaceId, userId });
}

export async function listMembers(workspaceId) {
  return Membership.find({ workspaceId }).populate('userId', 'name email');
}

export async function countOwners(workspaceId) {
  return Membership.countDocuments({ workspaceId, role: 'owner' });
}

export async function updateRole(workspaceId, membershipId, newRole) {
  return Membership.findOneAndUpdate(
    { _id: membershipId, workspaceId },
    { role: newRole },
    { new: true }
  );
}
