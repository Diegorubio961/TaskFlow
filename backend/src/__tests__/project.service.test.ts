/**
 * Tests unitarios de ProjectService centrados en la verificación de propiedad
 * (ownership): un usuario no puede acceder a proyectos de otro (403) ni a
 * proyectos inexistentes (404).
 */
import { describe, expect, it } from 'vitest';
import { ProjectService } from '../services/project.service.js';
import type {
  IProjectRepository,
  ProjectInput,
} from '../repositories/project.repository.js';
import type { Project } from '../domain/types.js';

class InMemoryProjectRepository implements IProjectRepository {
  private projects: Project[] = [];

  async findAllByOwner(ownerId: string): Promise<Project[]> {
    return this.projects.filter((p) => p.ownerId === ownerId);
  }

  async findById(id: string): Promise<Project | null> {
    return this.projects.find((p) => p.id === id) ?? null;
  }

  async create(ownerId: string, data: ProjectInput): Promise<Project> {
    const project: Project = {
      id: `proj-${this.projects.length + 1}`,
      name: data.name,
      description: data.description ?? null,
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.push(project);
    return project;
  }

  async update(id: string, data: Partial<ProjectInput>): Promise<Project> {
    const project = this.projects.find((p) => p.id === id)!;
    Object.assign(project, data);
    return project;
  }

  async delete(id: string): Promise<void> {
    this.projects = this.projects.filter((p) => p.id !== id);
  }
}

describe('ProjectService — ownership', () => {
  it('devuelve el proyecto a su propietario', async () => {
    const service = new ProjectService(new InMemoryProjectRepository());
    const created = await service.create('user-1', { name: 'Mío' });

    const found = await service.getOwned(created.id, 'user-1');
    expect(found.id).toBe(created.id);
  });

  it('lanza 403 si el proyecto pertenece a otro usuario', async () => {
    const service = new ProjectService(new InMemoryProjectRepository());
    const created = await service.create('user-1', { name: 'Ajeno' });

    await expect(service.getOwned(created.id, 'user-2')).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('lanza 404 si el proyecto no existe', async () => {
    const service = new ProjectService(new InMemoryProjectRepository());
    await expect(service.getOwned('inexistente', 'user-1')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
