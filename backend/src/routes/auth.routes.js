const r = require('express').Router();
const c = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

r.post('/register', c.register);
r.post('/login', c.login);
r.get('/me', auth, c.me);  // optional protected endpoint
r.post('/forgot-password', c.forgotPassword);

module.exports = r;
