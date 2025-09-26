const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected');
    app.listen(PORT, () => logger.info(`API listening on :${PORT}`));
  })
  .catch((e) => {
    logger.error({ err: e }, 'MongoDB connection failed');
    process.exit(1);
  });
