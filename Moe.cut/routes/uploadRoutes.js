import express from 'express';
import mongoose from 'mongoose';
import UploadedImage from '../models/UploadedImage.js';
const router = express.Router();
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Image not found' });
    const image = await UploadedImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });
    res.set('Content-Type', image.contentType);
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(image.data);
  } catch (error) { next(error); }
});
export default router;
