import { Response } from 'express';
import prisma, { isPrismaInitError } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth';

export async function getTasks(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  try {
    const tasks = await prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    res.json(tasks);
  } catch (err) {
    if (isPrismaInitError(err) || (err as any)?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createTask(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const task = await prisma.task.create({ data: { title, description, userId } });
    res.status(201).json(task);
  } catch (err) {
    if (isPrismaInitError(err) || (err as any)?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateTask(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  const { title, description, completed } = req.body;
  try {
    const updated = await prisma.task.update({
      where: { id, userId },
      data: { title, description, completed },
    });
    res.json(updated);
  } catch (err) {
    if (isPrismaInitError(err) || (err as any)?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    res.status(404).json({ error: 'Task not found' });
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  try {
    const deleted = await prisma.task.delete({ where: { id, userId } as any });
    res.json(deleted);
  } catch (err) {
    if (isPrismaInitError(err) || (err as any)?.message?.includes("Can't reach database server")) {
      return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
    }
    res.status(404).json({ error: 'Task not found' });
  }
}
