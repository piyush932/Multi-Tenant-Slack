import { useParams } from 'react-router-dom';

export const WorkspaceSpecialPage = ({ type }) => {
    const { workspaceId } = useParams();
    const isThreads = type === 'threads';

    return (
        <div className="h-full flex flex-col items-center justify-center text-white/70 gap-3">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl">
                {isThreads ? '💬' : '✈️'}
            </div>
            <h2 className="text-lg text-white">{isThreads ? 'Threads' : 'Drafts & Sends'}</h2>
            <p className="text-sm text-white/50 max-w-sm text-center">
                {isThreads
                    ? 'Thread replies will appear here once threaded conversations are implemented.'
                    : 'Saved drafts and scheduled messages will appear here once the drafts feature is implemented.'}
            </p>
            <p className="text-xs text-white/30">Workspace: {workspaceId}</p>
        </div>
    );
};
