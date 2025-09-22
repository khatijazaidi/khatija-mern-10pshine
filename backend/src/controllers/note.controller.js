const Note = require('../models/Note');
const logger = require('../config/logger');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/notes
exports.list = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.json({ notes });
});

// GET /api/notes/:id (optional, helpful for editor)
exports.getOne = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  if (!note) return res.status(404).json({ message: 'Not found' });
  res.json({ note });
});

// POST /api/notes
exports.create = asyncHandler(async (req, res) => {
  const { title = '', content = '' } = req.body;
  const note = await Note.create({ user: req.user.id, title, content });
  logger.info({ userId: req.user.id, noteId: note._id }, 'note created');
  res.status(201).json({ note });
});

// PUT /api/notes/:id
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await Note.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { $set: { title: req.body.title, content: req.body.content } },
    { new: true }
  );
  if (!note) return res.status(404).json({ message: 'Not found' });
  logger.info({ userId: req.user.id, noteId: id }, 'note updated');
  res.json({ note });
});

// DELETE /api/notes/:id
exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Note.findOneAndDelete({ _id: id, user: req.user.id });
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  logger.info({ userId: req.user.id, noteId: id }, 'note deleted');
  res.json({ success: true });
});
