import express from 'express';
import { verifyRefreshToken, generateAccessToken } from '../../services/token';

const router = express.Router();

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });

  try {
    const decoded = verifyRefreshToken(refreshToken) as { id: number; email: string };
    const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email });
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

export default router;
