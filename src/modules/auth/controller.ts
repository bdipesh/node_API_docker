import { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken } from '../../services/token';
import prisma, { isPrismaInitError } from '../../lib/prisma';

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password }: { name?: string; email?: string; password?: string } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    const user = await prisma.user.create({ data: { name, email, password } });
    const payload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken });
  } catch (err) {
    if (isPrismaInitError(err) || (err as any)?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return res.json({ accessToken, refreshToken });
  } catch (err) {
    if (isPrismaInitError(err) || (err as any)?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
