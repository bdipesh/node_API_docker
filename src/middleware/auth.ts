import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token';

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const decoded = verifyAccessToken(token) as any;
    if (!decoded || typeof decoded !== 'object' || decoded.id == null) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
