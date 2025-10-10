const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');


const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1d' });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    logger.info({ id: user._id, email: user.email }, 'user registered');
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    logger.info({ id: user._id, email: user.email }, 'user logged in');

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    const ttl = Number(process.env.RESET_TOKEN_TTL_MINUTES || 20);

    if (user) {
      // Create short-lived JWT reset token
      const resetToken = jwt.sign(
        { sub: user._id.toString(), purpose: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: `${ttl}m` }
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      console.log('[DEV ONLY] resetUrl:', resetUrl);
      const html = `
        <p>You requested a password reset for <b>${process.env.APP_NAME || 'our app'}</b>.</p>
        <p>This link expires in ${ttl} minutes:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, ignore this email.</p>
      `;

      await sendEmail({ to: email, subject: 'Reset your password', html });
    }

    // Always return 200 to avoid leaking whether the email exists
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: 'Token and new password are required' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (payload.purpose !== 'password_reset')
      return res.status(400).json({ message: 'Invalid token purpose' });

    const user = await User.findById(payload.sub);
    if (!user) return res.status(400).json({ message: 'User no longer exists' });

    // Hash new password (you already store bcrypt hashes)
    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();

    return res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    next(err);
  }
};



// GET /api/auth/me  (optional)
exports.me = async (req, res) => {
  res.json({ user: req.user });
};
