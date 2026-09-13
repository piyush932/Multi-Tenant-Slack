import { useEffect, useState } from 'react';
import { listMembers, changeMemberRole } from '../../../apis/memberships';

export default function MembersPage({ workspaceId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await listMembers(workspaceId);
        setMembers(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load members');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [workspaceId]);

  const handleRoleChange = async (membershipId, newRole) => {
    try {
      await changeMemberRole(membershipId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m._id === membershipId ? { ...m, role: newRole } : m))
      );
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to change role');
    }
  };

  if (loading) return <div>Loading members...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Workspace Members</h2>
      <ul>
        {members.map((m) => (
          <li key={m._id}>
            {m.userId?.name || m.userId?.email} — {m.role}{' '}
            <select
              value={m.role}
              onChange={(e) => handleRoleChange(m._id, e.target.value)}
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
