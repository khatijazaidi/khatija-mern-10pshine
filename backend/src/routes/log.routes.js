const router = require('express').Router();
const logger = require('../config/logger');
// const auth = require('../middleware/auth'); // enable if you want only authed users

router.post('/', (req, res) => {
  const { level = 'info', message = '', meta = {} } = req.body || {};

// Pick the logger function dynamically and call it correctly
if (logger[level]) {
  logger[level]({ frontend: true, ...meta }, message);
} else {
  logger.info({ frontend: true, ...meta }, message);
}

res.json({ success: true });

});

module.exports = router;
