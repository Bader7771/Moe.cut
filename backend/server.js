import multer from 'multer';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import authRoutes from './routes/authRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const app = express();
const PORT = process.env.PORT || 5001;

const ready = process.env.DATA_STORE === 'file' ? Promise.resolve() : connectDB();
// Attach a rejection handler immediately; requests still receive the original error.
ready.catch(error => console.error(error.message));

// Middleware
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', async (req, res, next) => {
  try { await ready; next(); } catch { res.status(503).json({ message: 'Database unavailable. Check MONGO_URI or use the local npm run dev command.' }); }
});
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', storage: process.env.DATA_STORE === 'file' ? 'file' : 'mongodb' });
});

// Serve static frontend in production / local full-stack test
app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

app.use((error, req, res, _next) => {
  console.error(error.message);
  res.status(error.name === 'ValidationError' || error instanceof multer.MulterError ? 400 : 500).json({ message: error.message });
});

if (!process.env.VERCEL) {
  ready.then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
export default app;
