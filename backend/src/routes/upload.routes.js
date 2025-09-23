const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');

const router = express.Router();

// create folder "uploads" if not exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// storage setup
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// POST /api/uploads
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  // TinyMCE expects { location: 'url' } for images
  res.json({ location: publicUrl, filename: req.file.originalname });
});

module.exports = router;
