import axios from 'axios';

export async function listMembers(workspaceId) {
  const response = await axios.get(`/api/workspaces/${workspaceId}/members`);
  return response.data;
}

export async function changeMemberRole(membershipId, role) {
  const response = await axios.patch(`/api/memberships/${membershipId}`, {
    role,
  });
  return response.data;
}
