import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } });
  res.json(users);
}

export async function getUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}

export async function createUser(req: Request, res: Response) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password are required' });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already in use' });
  const user = await prisma.user.create({ data: { name, email, password }, select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } });
  res.status(201).json(user);
}

export async function updateUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { name, email, password } = req.body || {};
  try {
    const updated = await prisma.user.update({ where: { id }, data: { name, email, password }, select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const deleted = await prisma.user.delete({ where: { id }, select: { id: true, name: true, email: true } });
    res.json(deleted);
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
}
