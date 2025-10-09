import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken } from '../../services/token';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password }: { name?: string; email?: string; password?: string } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  const user = await prisma.user.create({ data: { name, email, password } });
  const payload = { id: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const payload = { id: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return res.json({ accessToken, refreshToken });
};
