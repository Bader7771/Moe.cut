import multer from 'multer';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
export const uploadDirectory = fileURLToPath(new URL('../uploads/', import.meta.url));
export const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { mkdirSync(uploadDirectory, { recursive: true }); cb(null, uploadDirectory); },
    filename(req, file, cb) { cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`); }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const valid = /\.(jpe?g|png|webp|gif)$/i.test(file.originalname) && /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    cb(valid ? null : new Error('Upload a JPG, PNG, WebP, or GIF image.'), valid);
  }
});
