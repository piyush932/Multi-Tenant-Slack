import { useContext } from 'react';
import WorkspaceSettingsModalContext from '@/context/WorkspaceSettingsModalContext';

export const useWorkspaceSettingsModal = () => {
    return useContext(WorkspaceSettingsModalContext);
};
