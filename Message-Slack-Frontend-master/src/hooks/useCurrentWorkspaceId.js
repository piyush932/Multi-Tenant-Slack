import { useParams } from 'react-router-dom';

export function useCurrentWorkspaceId() {
  const { workspaceId } = useParams();
  return workspaceId;
}
