import Message from '../schema/message.js';

export async function searchMessagesInWorkspace(workspaceId, queryText, { page = 1, limit = 20 } = {}) {
  if (!workspaceId) {
    throw new Error('searchMessagesInWorkspace() called without a workspaceId — refusing to run an unscoped search');
  }
  return Message.find(
    { workspaceId, $text: { $search: queryText } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(limit);
}
