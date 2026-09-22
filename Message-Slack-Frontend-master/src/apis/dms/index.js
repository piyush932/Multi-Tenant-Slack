import axios from '@/config/axiosConfig';

export const getDmMessages = async ({ workspaceId, memberId, token }) => {
    const response = await axios.get(`/workspaces/${workspaceId}/dms/${memberId}`, {
        headers: { 'x-access-token': token },
    });
    return response.data;
};

export const sendDmMessage = async ({ workspaceId, memberId, body, token }) => {
    const response = await axios.post(
        `/workspaces/${workspaceId}/dms/${memberId}`,
        { body },
        { headers: { 'x-access-token': token } }
    );
    return response.data;
};
