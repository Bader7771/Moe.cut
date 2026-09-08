import express from 'express';
import jwt from 'jsonwebtoken';
import { protect, getSecret, adminUsername } from '../middleware/auth.js';
const router = express.Router();
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== adminUsername() || password !== (process.env.ADMIN_PASSWORD || 'skimo7777')) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  res.json({ token: jwt.sign({ user: { username } }, getSecret(), { expiresIn: '10h' }) });
});
router.get('/me', protect, (req, res) => res.json(req.user));
export default router;
