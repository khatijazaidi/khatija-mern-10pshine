require('dotenv').config();
const express = require('express');
const cors = require('cors');
const httpLogger = require('./middleware/httpLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// allow your React app to call the API
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(httpLogger);

// health check route (lets us confirm server & logs work)
app.get('/api/health', (req, res) => res.json({ ok: true }));

// (later) app.use('/api/auth', authRoutes)
// (later) app.use('/api/notes', noteRoutes)

app.use(errorHandler);
module.exports = app;
