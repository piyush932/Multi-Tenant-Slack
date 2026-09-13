import { canPerform } from '../services/permissionMatrix.js';

function requirePermission(action) {
  return (req, res, next) => {
    const role = req.ctx?.role;
    if (!role || !canPerform(role, action)) {
      return req.ctx
        ? res.status(403).json({ message: 'Forbidden' })
        : res.status(404).json({ message: 'Not found' });
    }
    return next();
  };
}

export default requirePermission;
