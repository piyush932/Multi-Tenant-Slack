import { createContext, useState } from 'react';

const WorkspaceSettingsModalContext = createContext();

export const WorkspaceSettingsModalContextProvider = ({ children }) => {
    const [openWorkspaceSettingsModal, setOpenWorkspaceSettingsModal] = useState(false);

    return (
        <WorkspaceSettingsModalContext.Provider
            value={{ openWorkspaceSettingsModal, setOpenWorkspaceSettingsModal }}
        >
            {children}
        </WorkspaceSettingsModalContext.Provider>
    );
};

export default WorkspaceSettingsModalContext;
