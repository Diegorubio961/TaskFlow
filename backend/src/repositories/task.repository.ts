/** Repositorio de tareas (contrato + implementación Prisma). */
import type { PrismaClient, Task, TaskPriority, TaskStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/prisma.js';

export interface CreateTaskData {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export type UpdateTaskData = Partial<CreateTaskData & { order: number }>;

export interface MoveTaskData {
  status: TaskStatus;
  order: number;
}

export interface ITaskRepository {
  findAllByProject(projectId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(projectId: string, data: CreateTaskData): Promise<Task>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  move(id: string, data: MoveTaskData): Promise<Task>;
  delete(id: string): Promise<void>;
}

export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  findAllByProject(projectId: string): Promise<Task[]> {
    return this.db.task.findMany({
      where: { projectId },
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  findById(id: string): Promise<Task | null> {
    return this.db.task.findUnique({ where: { id } });
  }

  create(projectId: string, data: CreateTaskData): Promise<Task> {
    return this.db.task.create({ data: { ...data, projectId } });
  }

  update(id: string, data: UpdateTaskData): Promise<Task> {
    return this.db.task.update({ where: { id }, data });
  }

  move(id: string, data: MoveTaskData): Promise<Task> {
    return this.db.task.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.task.delete({ where: { id } });
  }
}
