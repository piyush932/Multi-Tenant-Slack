import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetWorkspaceById } from '@/hooks/apis/workspaces/useGetWorkspaceById';

export const WorkspaceHome = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const { data: workspace, isLoading } = useGetWorkspaceById({ workspaceId });

    useEffect(() => {
        if (!isLoading && workspace?.channels?.length > 0) {
            const firstChannelId = workspace.channels[0]._id || workspace.channels[0];
            navigate(`/workspaces/${workspaceId}/channels/${firstChannelId}`, { replace: true });
        }
    }, [isLoading, workspace, workspaceId, navigate]);

    return (
        <div className="h-full flex items-center justify-center text-white/60 text-sm">
            Loading workspace...
        </div>
    );
};
