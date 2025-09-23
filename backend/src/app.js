require('dotenv').config();
const express = require('express');
const cors = require('cors');
const httpLogger = require('./middleware/httpLogger');
const errorHandler = require('./middleware/errorHandler');
import uploadRoutes from "./routes/uploadRoutes.js";


const app = express();
const path = require('path');
const uploadRoutes = require('./routes/upload.routes');

// serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// upload route
app.use('/api/uploads', uploadRoutes);

// allow your React app to call the API
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(httpLogger);

// health check route (lets us confirm server & logs work)
app.get('/api/health', (req, res) => res.json({ ok: true }));

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const noteRoutes = require('./routes/note.routes');
app.use('/api/notes', noteRoutes);

// (later) app.use('/api/notes', noteRoutes)

app.use(errorHandler);
module.exports = app;
