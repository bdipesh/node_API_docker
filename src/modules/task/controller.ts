import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';
const prisma = new PrismaClient();

export async function getTasks(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const tasks = await prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  res.json(tasks);
}

export async function createTask(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const task = await prisma.task.create({ data: { title, description, userId } });
  res.status(201).json(task);
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
  } catch {
    res.status(404).json({ error: 'Task not found' });
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  try {
    const deleted = await prisma.task.delete({ where: { id, userId } as any });
    res.json(deleted);
  } catch {
    res.status(404).json({ error: 'Task not found' });
  }
}
