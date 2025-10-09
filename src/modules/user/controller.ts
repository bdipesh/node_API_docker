import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma, { isPrismaInitError } from '../../lib/prisma';

export async function listUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } });
    res.json(users);
  } catch (err) {
    if (isPrismaInitError(err) || (err as any)?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    if (isPrismaInitError(err) || (err as any)?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createUser(req: Request, res: Response) {
  const body = req.body || {};
  let name = body?.name;
  let email = body?.email;
  let password = body?.password;

  if (name !== undefined) name = String(name).trim();
  if (email !== undefined) email = String(email).trim().toLowerCase();
  if (password !== undefined) password = String(password);

  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password are required' });
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    const user = await prisma.user.create({ data: { name, email, password }, select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } });
    res.status(201).json(user);
  } catch (err: any) {
    if (isPrismaInitError(err) || err?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return res.status(409).json({ error: 'Email already in use' });
      if (err.code === 'P2021' || err.code === 'P2022') return res.status(503).json({ error: 'Database schema is not ready. Please try again in a moment.' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const body = req.body || {};
  let name = body?.name;
  let email = body?.email;
  let password = body?.password;

  if (name !== undefined) name = String(name).trim();
  if (email !== undefined) email = String(email).trim().toLowerCase();
  if (password !== undefined) password = String(password);

  try {
    const updated = await prisma.user.update({ where: { id }, data: { name, email, password }, select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } });
    res.json(updated);
  } catch (err) {
    if (isPrismaInitError(err) || (err as any)?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    res.status(404).json({ error: 'User not found' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const deleted = await prisma.user.delete({ where: { id }, select: { id: true, name: true, email: true } });
    res.json(deleted);
  } catch (err) {
    if (isPrismaInitError(err) || (err as any)?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    res.status(404).json({ error: 'User not found' });
  }
}
