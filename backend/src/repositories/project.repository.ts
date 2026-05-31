/** Repositorio de proyectos (contrato + implementación Prisma). */
import type { PrismaClient, Project } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/prisma.js';

export interface ProjectInput {
  name: string;
  description?: string | null;
}

export interface IProjectRepository {
  findAllByOwner(ownerId: string): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  create(ownerId: string, data: ProjectInput): Promise<Project>;
  update(id: string, data: Partial<ProjectInput>): Promise<Project>;
  delete(id: string): Promise<void>;
}

export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  findAllByOwner(ownerId: string): Promise<Project[]> {
    return this.db.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tasks: true } } },
    });
  }

  findById(id: string): Promise<Project | null> {
    return this.db.project.findUnique({ where: { id } });
  }

  create(ownerId: string, data: ProjectInput): Promise<Project> {
    return this.db.project.create({ data: { ...data, ownerId } });
  }

  update(id: string, data: Partial<ProjectInput>): Promise<Project> {
    return this.db.project.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.project.delete({ where: { id } });
  }
}
