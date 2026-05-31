import type { Project } from '../domain/types.js';
import {
  PgProjectRepository,
  type IProjectRepository,
  type ProjectInput,
} from '../repositories/project.repository.js';
import { ForbiddenError, NotFoundError } from '../errors/AppError.js';

export class ProjectService {
  constructor(private readonly projects: IProjectRepository = new PgProjectRepository()) {}

  list(ownerId: string): Promise<Project[]> {
    return this.projects.findAllByOwner(ownerId);
  }

  async getOwned(id: string, ownerId: string): Promise<Project> {
    const project = await this.projects.findById(id);
    if (!project) throw new NotFoundError('Proyecto no encontrado');
    if (project.ownerId !== ownerId) throw new ForbiddenError('Este proyecto pertenece a otro usuario');
    return project;
  }

  create(ownerId: string, data: ProjectInput): Promise<Project> {
    return this.projects.create(ownerId, data);
  }

  async update(id: string, ownerId: string, data: Partial<ProjectInput>): Promise<Project> {
    await this.getOwned(id, ownerId);
    return this.projects.update(id, data);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    await this.getOwned(id, ownerId);
    await this.projects.delete(id);
  }
}
