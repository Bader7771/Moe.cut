import { validateEnvironment } from './config/env.js';
import multer from 'multer';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import connectDB from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import authRoutes from './routes/authRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
// Same-origin frontend/API requests need no CORS middleware.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  try { validateEnvironment(); next(); }
  catch (error) { console.error(error.message); res.status(503).json({ message: 'Server configuration is incomplete. Check deployment environment variables.' }); }
});
app.use('/api/auth', authRoutes);
app.get('/api/hello', (req, res) => res.json({ message: 'Hello from Vercel API!' }));
async function databaseReady(req, res, next) {
  try { await connectDB(); next(); }
  catch { res.status(503).json({ message: 'Database unavailable. Check MONGO_URI and database network access.' }); }
}
app.get('/api/health', databaseReady, (req, res) => {
  res.json({ status: 'ok', storage: process.env.DATA_STORE === 'file' ? 'file' : 'mongodb' });
});
app.use('/api/projects', databaseReady, projectRoutes);
app.use('/api/testimonials', databaseReady, testimonialRoutes);
app.use('/api/uploads', databaseReady, uploadRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Vercel serves dist directly. Express serves files only during local runs.
if (!process.env.VERCEL) {
  const directory = fileURLToPath(new URL('.', import.meta.url));
  app.use('/uploads', express.static(path.join(directory, 'uploads')));
  app.use(express.static(path.join(directory, 'dist')));
  app.get(['/', '/login', '/admin'], (req, res) => res.sendFile(path.join(directory, 'dist/index.html')));
}
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((error, req, res, _next) => {
  const status = error.code === 'LIMIT_FILE_SIZE' ? 413
    : error.code === 11000 ? 409
    : error.name === 'ValidationError' || error instanceof multer.MulterError ? 400
    : error.status || 500;
  if (status >= 500) console.error(error.name);
  res.status(status).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Uploads must be 4 MiB or smaller.'
    : status >= 500 ? 'Unable to complete this request. Please try again.' : error.message });
});
export default app;
