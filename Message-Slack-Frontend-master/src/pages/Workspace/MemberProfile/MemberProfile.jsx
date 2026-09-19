import { useParams } from 'react-router-dom';

export const MemberProfile = () => {
  const { workspaceId, memberId } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <h2>Direct message / Member profile</h2>
      <p>Workspace: {workspaceId}</p>
      <p>Member: {memberId}</p>
      <p style={{ opacity: 0.6 }}>Wire up direct-message history or profile details here.</p>
    </div>
  );
};
