import { useCurrentWorkspace } from '@/hooks/context/useCurrentWorkspace';
import { useWorkspaceSettingsModal } from '@/hooks/context/useWorkspaceSettingsModal';

export const WorkspaceSettingsModal = () => {
    const { openWorkspaceSettingsModal, setOpenWorkspaceSettingsModal } = useWorkspaceSettingsModal();
    const { currentWorkspace } = useCurrentWorkspace();

    if (!openWorkspaceSettingsModal) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setOpenWorkspaceSettingsModal(false)}
        >
            <div
                className="bg-[#1a1d21] text-white rounded-lg p-6 w-[420px]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4">Workspace Settings</h2>
                <div className="space-y-2 text-sm text-white/80">
                    <div className="flex justify-between">
                        <span className="text-white/50">Name</span>
                        <span>{currentWorkspace?.name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/50">Join code</span>
                        <span>{currentWorkspace?.joinCode || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/50">Plan</span>
                        <span className="capitalize">{currentWorkspace?.plan || 'free'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/50">Members</span>
                        <span>{currentWorkspace?.members?.length ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/50">Channels</span>
                        <span>{currentWorkspace?.channels?.length ?? '—'}</span>
                    </div>
                </div>
                <button
                    onClick={() => setOpenWorkspaceSettingsModal(false)}
                    className="mt-5 w-full bg-white/10 hover:bg-white/20 text-sm rounded-md py-2"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
