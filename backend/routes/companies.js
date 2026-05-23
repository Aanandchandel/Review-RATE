const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Company = require('../models/Company');
const Review = require('../models/Review');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

async function attachReviewStats(companies) {
  return Promise.all(
    companies.map(async (company) => {
      const reviews = await Review.find({ company: company._id }, 'rating');
      const avgRating =
        reviews.length > 0
          ? parseFloat(
              (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
            )
          : 0;
      return { ...company.toObject(), reviewCount: reviews.length, avgRating };
    })
  );
}

// GET /api/companies
router.get('/', async (req, res) => {
  try {
    const { search, city, sort = 'name', page = 1, limit = 20 } = req.query;
    const query = {};

    if (city && city.trim()) {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const sortMap = {
      name: { name: 1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      founded: { foundedOn: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.name;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [companies, total] = await Promise.all([
      Company.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Company.countDocuments(query),
    ]);

    const companiesWithStats = await attachReviewStats(companies);

    res.json({ companies: companiesWithStats, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/companies
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const { name, description, location, city, foundedOn } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : '';
    const company = new Company({ name, description, location, city, foundedOn, logo });
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/companies/:id
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const [withStats] = await attachReviewStats([company]);
    res.json(withStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/companies/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { sort = 'newest' } = req.query;
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1 },
      lowest: { rating: 1 },
      likes: { likes: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.newest;

    const reviews = await Review.find({ company: req.params.id }).sort(sortObj);
    const avgRating =
      reviews.length > 0
        ? parseFloat(
            (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
          )
        : 0;

    res.json({ reviews, avgRating, total: reviews.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/companies/:id/reviews
router.post('/:id/reviews', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const { fullName, subject, reviewText, rating } = req.body;
    const review = new Review({
      company: req.params.id,
      fullName,
      subject,
      reviewText,
      rating: parseInt(rating),
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
