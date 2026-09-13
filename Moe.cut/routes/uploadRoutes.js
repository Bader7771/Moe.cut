import express from 'express';
import mongoose from 'mongoose';
import UploadedImage from '../models/UploadedImage.js';
const router = express.Router();
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Upload not found' });
    const file = await UploadedImage.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'Upload not found' });
    const data = Buffer.from(file.data);
    res.set('Content-Type', file.contentType);
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', file.contentType.startsWith('video/') ? 'no-cache' : 'public, max-age=31536000, immutable');
    res.set('Accept-Ranges', 'bytes');
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      let start, end;
      if (match && (match[1] || match[2])) {
        start = match[1] ? Number(match[1]) : Math.max(0, data.length - Number(match[2]));
        end = match[1] && match[2] ? Math.min(Number(match[2]), data.length - 1) : data.length - 1;
      }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= data.length) {
        return res.status(416).set('Content-Range', `bytes */${data.length}`).end();
      }
      res.status(206).set('Content-Range', `bytes ${start}-${end}/${data.length}`);
      return res.send(data.subarray(start, end + 1));
    }
    res.send(data);
  } catch (error) { next(error); }
});
export default router;
