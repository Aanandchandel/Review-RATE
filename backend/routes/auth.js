const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_saksljdflasdfjpfjlaksjefwj';
const JWT_EXPIRES = '7d';

// ---------- Authentication Middleware ----------
async function attachUser(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    req.user = user || null;
  } catch (err) {
    req.user = null;
  }
  next();
}

function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}
// ------------------------------------------------

// ---------- Multer Configuration for Profile Pictures ----------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});
// ----------------------------------------------------------------

// Helper: sign JWT
function signToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// ---------- Routes ----------

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hash,
      profileUrl: '', // default empty
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, profileUrl: user.profileUrl || '' },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, profileUrl: user.profileUrl || '' },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/upload-profile
router.post('/upload-profile', requireUser, upload.single('profileImage'), async (req, res) => {
  let oldFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // 1. Get current user's existing profileUrl
    const currentUser = await User.findById(req.user._id).select('profileUrl');
    if (currentUser && currentUser.profileUrl) {
      // Only delete if it's a local file (starts with our URL pattern)
      const url = currentUser.profileUrl;
      if (url.includes('/uploads/profiles/')) {
        const filename = path.basename(url);
        oldFilePath = path.join(__dirname, '../uploads/profiles', filename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // delete old file
          console.log(`Deleted old profile image: ${oldFilePath}`);
        }
      }
    }

    // 2. Construct public URL for the new file
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;

    // 3. Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileUrl: imageUrl },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      // Rollback: delete the newly uploaded file
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile picture uploaded successfully',
      user: updatedUser,
    });
  } catch (err) {
    // Cleanup: delete the newly uploaded file on any error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;