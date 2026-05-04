const config = require('../config');

module.exports = function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.adminToken;
  if (!token || token !== config.adminToken) {
    return res.status(401).json({ error: 'Unauthorized: invalid admin token' });
  }
  next();
};
