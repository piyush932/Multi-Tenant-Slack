import { StatusCodes } from 'http-status-codes';
import { searchMessagesInWorkspace } from '../services/searchService.js';

export async function searchHandler(req, res) {
  try {
    const { q, page, limit } = req.query;
    if (!q || !q.trim()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Query param "q" is required' });
    }
    const results = await searchMessagesInWorkspace(req.ctx.workspaceId, q, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    return res.status(StatusCodes.OK).json({ success: true, data: results });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
}
