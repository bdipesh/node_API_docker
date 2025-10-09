import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getTasks(req: Request, res: Response) {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(tasks);
}

export async function createTask(req: Request, res: Response) {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const task = await prisma.task.create({ data: { title, description } });
  res.status(201).json(task);
}

export async function updateTask(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { title, description, completed } = req.body;
  try {
    const updated = await prisma.task.update({
      where: { id },
      data: { title, description, completed },
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Task not found' });
  }
}

export async function deleteTask(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const deleted = await prisma.task.delete({ where: { id } });
    res.json(deleted);
  } catch {
    res.status(404).json({ error: 'Task not found' });
  }
}
