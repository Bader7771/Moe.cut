import express from 'express';
import Collaborator from '../models/Collaborator.js';
import { store } from '../services/store.js';
import { upload, saveUpload, removeUpload } from '../services/upload.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
const records = store(Collaborator, 'collaborators');
const publicRecord = record => ({ _id: String(record._id), id: String(record._id), name: record.name, image: record.image, followers: record.followers, createdAt: record.createdAt, updatedAt: record.updatedAt });
router.get('/', async (req, res, next) => {
  try { res.json((await records.list()).filter(c => c.name && c.image && c.followers).map(publicRecord)); }
  catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const record = await records.get(req.params.id);
    if (!record?.image) return res.status(404).json({ message: 'Collaborator not found' });
    res.json(publicRecord(record));
  } catch (error) { next(error); }
});
async function cleanup(url) {
  try { await removeUpload(url); } catch { console.error('Unable to clean up collaborator upload'); }
}
async function save(req, res, next) {
  let newImage;
  try {
    const previous = req.params.id ? await records.get(req.params.id) : null;
    if (req.params.id && !previous) return res.status(404).json({ message: 'Collaborator not found' });
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const followers = typeof req.body?.followers === 'string' ? req.body.followers.trim() : '';
    if (!name || name.length > 200) return res.status(400).json({ message: 'Enter a collaborator name between 1 and 200 characters.' });
    if (!followers || followers.length > 100) return res.status(400).json({ message: 'Enter followers between 1 and 100 characters.' });
    if (!req.file && !previous?.image) return res.status(400).json({ message: 'A collaborator image is required.' });
    if (req.file) newImage = await saveUpload(req.file);
    const record = await records.save({ name, followers, image: newImage || previous.image }, req.params.id);
    if (!record) { await cleanup(newImage); return res.status(404).json({ message: 'Collaborator not found' }); }
    if (newImage && previous?.image !== newImage) await cleanup(previous?.image);
    res.status(req.params.id ? 200 : 201).json(publicRecord(record));
  } catch (error) { await cleanup(newImage); next(error); }
}
router.post('/', protect, upload.single('image'), save);
router.put('/:id', protect, upload.single('image'), save);
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const record = await records.remove(req.params.id);
    if (!record) return res.status(404).json({ message: 'Collaborator not found' });
    await cleanup(record.image);
    res.json({ message: 'Collaborator removed' });
  } catch (error) { next(error); }
});
export default router;
