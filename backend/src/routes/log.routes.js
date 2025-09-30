const router = require('express').Router();
const logger = require('../config/logger');
// const auth = require('../middleware/auth'); // enable if you want only authed users

router.post('/', (req, res) => {
  const { level = 'info', message = '', meta = {} } = req.body || {};
  const fn = logger[level] || logger.info;
  fn({ frontend: true, ...meta }, message);
  res.json({ ok: true });
});

module.exports = router;
