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
// Body: { email, newPassword }
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'email and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(200)
        .json({ message: 'If the account exists, the password has been updated.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    user.passwordChangedAt = new Date();
    await user.save();

    logger.info({ id: user._id, email: user.email }, 'password reset successfully');
    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};


// GET /api/auth/me  (optional)
exports.me = async (req, res) => {
  res.json({ user: req.user });
};