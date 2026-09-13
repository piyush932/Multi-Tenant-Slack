export const ROLE_MATRIX = {
  owner: [
    'workspace:update',
    'workspace:delete',
    'membership:invite',
    'membership:changeRole',
    'membership:remove',
    'channel:create',
    'channel:delete',
    'billing:manage',
  ],
  admin: [
    'membership:invite',
    'channel:create',
    'channel:delete',
    'membership:changeRole',
  ],
  member: ['channel:create'],
};

export function canPerform(role, action) {
  return Boolean(ROLE_MATRIX[role]?.includes(action));
}
