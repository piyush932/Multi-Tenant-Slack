import axios from 'axios';

export async function inviteMember(workspaceId, { email, role }) {
  const response = await axios.post(`/api/workspaces/${workspaceId}/invites`, {
    email,
    role,
  });
  return response.data;
}

export async function acceptInvite(token) {
  const response = await axios.post(`/api/invites/${token}/accept`);
  return response.data;
}
