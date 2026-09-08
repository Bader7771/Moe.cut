import express from 'express';
import Testimonial from '../models/Testimonial.js';
import { store } from '../services/store.js';
import { upload } from '../services/upload.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
const records = store(Testimonial, 'testimonials');
router.get('/', async (req, res, next) => {
  try { res.json(await records.list()); } catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try { const record = await records.get(req.params.id); if (record) res.json(record); else res.status(404).json({ message: 'Testimonial not found' }); } catch (error) { next(error); }
});
async function save(req, res, next) {
  try {
    const data = {};
    for (const key of 'clientName review image'.split(' ')) if (req.body[key] !== undefined) data[key] = req.body[key];
    
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const record = await records.save(data, req.params.id);
    if (!record) return res.status(404).json({ message: 'Testimonial not found' });
    res.status(req.params.id ? 200 : 201).json(record);
  } catch (error) { next(error); }
}
router.post('/', protect, upload.single('image'), save);
router.put('/:id', protect, upload.single('image'), save);
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const record = await records.remove(req.params.id);
    if (record) res.json({ message: 'Testimonial removed' }); else res.status(404).json({ message: 'Testimonial not found' });
  } catch (error) { next(error); }
});
export default router;
