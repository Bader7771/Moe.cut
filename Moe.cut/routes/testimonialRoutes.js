import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import Testimonial from '../models/Testimonial.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `testimonial-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  }
});

// Auth middleware
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
      jwt.verify(token, JWT_SECRET);
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// @route   GET /api/testimonials
// @desc    Get all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/testimonials
// @desc    Create a testimonial
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const { clientName, review } = req.body;

    const testimonial = new Testimonial({
      clientName,
      review,
      image: `/uploads/${req.file.filename}`
    });

    const createdTestimonial = await testimonial.save();
    res.status(201).json(createdTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/testimonials/:id
// @desc    Update a testimonial
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (testimonial) {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }
      
      Object.assign(testimonial, updateData);
      const updatedTestimonial = await testimonial.save();
      res.json(updatedTestimonial);
    } else {
      res.status(404).json({ message: 'Testimonial not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete a testimonial
router.delete('/:id', protect, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (testimonial) {
      await testimonial.deleteOne();
      res.json({ message: 'Testimonial removed' });
    } else {
      res.status(404).json({ message: 'Testimonial not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
