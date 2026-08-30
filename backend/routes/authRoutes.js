import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Hardcoded credentials based on user request
  if (username === 'skimo' && password === 'skimo7777') {
    // Create token
    const payload = {
      user: {
        username: 'skimo'
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '10h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } else {
    res.status(401).json({ message: 'Invalid Credentials' });
  }
});

export default router;
