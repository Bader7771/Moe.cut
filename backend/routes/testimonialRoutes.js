import express from 'express';
import Testimonial from '../models/Testimonial.js';
import { store } from '../services/store.js';
import { videoUpload, saveUpload, removeUpload } from '../services/upload.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
const records = store(Testimonial, 'testimonials');
const publicRecord = record => ({ _id: String(record._id), id: String(record._id), title: record.title, video: record.video });
// Keep legacy photo testimonials in storage, but never publish them as video entries.
router.get('/', async (req, res, next) => {
  try { res.json((await records.list()).filter(t => t.title && t.video).map(publicRecord)); }
  catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const record = await records.get(req.params.id);
    if (!record?.video) return res.status(404).json({ message: 'Testimonial not found' });
    res.json(publicRecord(record));
  } catch (error) { next(error); }
});
async function cleanup(url) {
  try { await removeUpload(url); } catch { console.error('Unable to clean up testimonial upload'); }
}
async function save(req, res, next) {
  let newVideo;
  try {
    const previous = req.params.id ? await records.get(req.params.id) : null;
    if (req.params.id && !previous) return res.status(404).json({ message: 'Testimonial not found' });
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    if (!title || title.length > 200) return res.status(400).json({ message: 'Enter a title between 1 and 200 characters.' });
    if (!req.file && !previous?.video) return res.status(400).json({ message: 'A testimonial video is required.' });
    if (req.file) newVideo = await saveUpload(req.file);
    const record = await records.save({ title, video: newVideo || previous.video }, req.params.id);
    if (!record) { await cleanup(newVideo); return res.status(404).json({ message: 'Testimonial not found' }); }
    if (newVideo && previous?.video !== newVideo) await cleanup(previous?.video);
    res.status(req.params.id ? 200 : 201).json(publicRecord(record));
  } catch (error) { await cleanup(newVideo); next(error); }
}
router.post('/', protect, videoUpload.single('video'), save);
router.put('/:id', protect, videoUpload.single('video'), save);
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const record = await records.remove(req.params.id);
    if (!record) return res.status(404).json({ message: 'Testimonial not found' });
    await cleanup(record.video);
    res.json({ message: 'Testimonial removed' });
  } catch (error) { next(error); }
});
export default router;
