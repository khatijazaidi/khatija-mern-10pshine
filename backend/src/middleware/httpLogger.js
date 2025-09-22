const pinoHttp = require('pino-http');
const logger = require('../config/logger');

module.exports = pinoHttp({
  logger, // now a compatible pino@8 instance
  customProps: (req) => ({ userId: req.user?.id }),
});
