const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  // one centralized log for all errors
  logger.error({ err }, err.message || 'Unhandled error');
  res.status(status).json({ success: false, message: err.message || 'Server error' });
};
