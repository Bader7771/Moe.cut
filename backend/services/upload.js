import multer from 'multer';
import path from 'node:path';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import UploadedImage from '../models/UploadedImage.js';
export const uploadDirectory = fileURLToPath(new URL('../uploads/', import.meta.url));
function makeUpload(kind) { return multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1, fields: 12, fieldSize: 8192 },
  fileFilter(req, file, cb) {
    const valid = kind === 'video'
      ? /\.(mp4|webm)$/i.test(file.originalname) && /^video\/(mp4|webm)$/.test(file.mimetype)
      : /\.(jpe?g|png|webp|gif)$/i.test(file.originalname) && /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    cb(valid ? null : Object.assign(new Error(kind === 'video' ? 'Upload an MP4 or WebM video.' : 'Upload a JPG, PNG, WebP, or GIF image.'), { status: 400 }), valid);
  }
}); }
export const upload = makeUpload('image');
export const videoUpload = makeUpload('video');
export async function saveUpload(file) {
  if (process.env.DATA_STORE === 'file' && !process.env.VERCEL) {
    const filename = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, filename), file.buffer);
    return `/uploads/${filename}`;
  }
  const image = await UploadedImage.create({ data: file.buffer, contentType: file.mimetype });
  return `/api/uploads/${image._id}`;
}

// Only remove managed uploads. Existing external/static image URLs are untouched.
export async function removeUpload(url) {
  if (!url) return;
  const mongo = /^\/api\/uploads\/([a-f0-9]{24})$/.exec(url);
  if (mongo) { await UploadedImage.deleteOne({ _id: mongo[1] }); return; }
  const local = /^\/uploads\/([a-f0-9-]+\.(?:mp4|webm))$/.exec(url);
  if (local && process.env.DATA_STORE === 'file' && !process.env.VERCEL) {
    try { await unlink(path.join(uploadDirectory, local[1])); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
