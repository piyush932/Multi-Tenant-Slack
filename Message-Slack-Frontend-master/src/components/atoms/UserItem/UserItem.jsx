import { Link } from 'react-router-dom';
import { useCurrentWorkspace } from '@/hooks/context/useCurrentWorkspace';

// THE ROOT CAUSE OF THE "undefined" BUG:
// context/WorkspaceContext.jsx provides:
//     <WorkspaceContext.Provider value={{ currentWorkspace, setCurrentWorkspace }}>
// i.e. the key is `currentWorkspace`, NOT `workspace`.
//
// This file previously did:
//     const { workspace } = useCurrentWorkspace();   // <-- wrong key name
// `workspace` was ALWAYS undefined because that key never existed on the
// context value in the first place — it's a naming mismatch between the
// provider and this consumer, not a timing/race issue. `workspace.id` (or
// `._id`) then evaluated to `undefined`, which is exactly what showed up in
// the broken URL: /workspace/undefined/members/...
//
// Fix: destructure the correct key (`currentWorkspace`), and build the URL
// against the routes actually registered in Routes.jsx — plural
// "/workspaces/", not singular "/workspace/".
export const UserItem = ({
    id,
    label = 'Member',
    image,
    variant,
}) => {
    const { currentWorkspace } = useCurrentWorkspace();

    // Defensive guard: WorkspaceContext initializes as `useState(null)`, so
    // there's a brief window on first render before it's populated. Render
    // as a plain, non-navigating item rather than producing a broken link.
    if (!currentWorkspace?._id) {
        return (
            <div className="flex items-center gap-x-2 px-4 py-1 text-sm text-white/70">
                {image && <img src={image} alt={label} className="w-6 h-6 rounded-md" />}
                <span className="truncate">{label}</span>
            </div>
        );
    }

    return (
        <Link
            to={`/workspaces/${currentWorkspace._id}/members/${id}`}
            className="flex items-center gap-x-2 px-4 py-1 rounded-md text-sm hover:bg-white/10 transition"
        >
            {image && <img src={image} alt={label} className="w-6 h-6 rounded-md" />}
            <span className="truncate">{label}</span>
        </Link>
    );
};
