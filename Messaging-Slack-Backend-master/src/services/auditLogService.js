import AuditLog from '../schema/auditLog.js';

export async function recordAuditLog({ workspaceId, actorId, action, targetType, targetId, metadata }) {
  try {
    await AuditLog.create({ workspaceId, actorId, action, targetType, targetId, metadata });
  } catch (err) {
    console.error('[auditLogService] Failed to record audit log:', action, err.message);
  }
}

export async function listAuditLogs(workspaceId, { page = 1, limit = 50 } = {}) {
  return AuditLog.find({ workspaceId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('actorId', 'name email');
}
