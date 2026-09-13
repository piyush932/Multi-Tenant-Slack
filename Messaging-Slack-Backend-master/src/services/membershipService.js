import {
  findMembership,
  countOwners,
  updateRole,
} from '../repositories/membershipRepository.js';

export async function changeRole(workspaceId, membershipId, newRole, actingUserId) {
  const targetMembership = await findMembership(workspaceId, actingUserId);
  if (!targetMembership) {
    throw Object.assign(new Error('Not found'), { statusCode: 404 });
  }

  const isSelf = String(targetMembership._id) === String(membershipId);
  const isDemotingFromOwner = targetMembership.role === 'owner' && newRole !== 'owner';

  if (isSelf && isDemotingFromOwner) {
    const ownerCount = await countOwners(workspaceId);
    if (ownerCount <= 1) {
      throw Object.assign(
        new Error('The last owner cannot demote themselves'),
        { statusCode: 409 }
      );
    }
  }

  const updated = await updateRole(workspaceId, membershipId, newRole);
  if (!updated) {
    throw Object.assign(new Error('Not found'), { statusCode: 404 });
  }
  return updated;
}
