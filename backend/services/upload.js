import multer from 'multer';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import UploadedImage from '../models/UploadedImage.js';
export const uploadDirectory = fileURLToPath(new URL('../uploads/', import.meta.url));
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1, fields: 12, fieldSize: 8192 },
  fileFilter(req, file, cb) {
    const valid = /\.(jpe?g|png|webp|gif)$/i.test(file.originalname) && /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    cb(valid ? null : Object.assign(new Error('Upload a JPG, PNG, WebP, or GIF image.'), { status: 400 }), valid);
  }
});
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
