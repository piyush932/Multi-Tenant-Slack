import Workspace from '../schema/workspace.js';
import { recordAuditLog } from './auditLogService.js';

const RETENTION_DAYS = 30;

export async function softDeleteWorkspace(workspaceId, actorId) {
  const workspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    { deletedAt: new Date(), status: 'suspended' },
    { new: true }
  );
  if (!workspace) {
    throw Object.assign(new Error('Not found'), { statusCode: 404 });
  }
  await recordAuditLog({
    workspaceId,
    actorId,
    action: 'workspace.soft_deleted',
    targetType: 'Workspace',
    targetId: workspaceId,
    metadata: { retentionDays: RETENTION_DAYS },
  });
  return workspace;
}

export async function restoreWorkspace(workspaceId, actorId) {
  const workspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId, deletedAt: { $ne: null } },
    { deletedAt: null, status: 'active' },
    { new: true }
  );
  if (!workspace) {
    throw Object.assign(new Error('Workspace not found or not deleted, or retention window expired'), { statusCode: 404 });
  }
  await recordAuditLog({
    workspaceId,
    actorId,
    action: 'workspace.restored',
    targetType: 'Workspace',
    targetId: workspaceId,
  });
  return workspace;
}

export async function purgeExpiredSoftDeletes() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const result = await Workspace.deleteMany({ deletedAt: { $ne: null, $lte: cutoff } });
  console.log(`[workspaceLifecycle] Purged ${result.deletedCount} workspace(s) past ${RETENTION_DAYS}-day retention.`);
  return result.deletedCount;
}
