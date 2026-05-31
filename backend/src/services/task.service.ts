import type { Task } from '../domain/types.js';
import {
  PgTaskRepository,
  type CreateTaskData,
  type ITaskRepository,
  type MoveTaskData,
  type UpdateTaskData,
} from '../repositories/task.repository.js';
import { ProjectService } from './project.service.js';
import { NotFoundError } from '../errors/AppError.js';

export class TaskService {
  constructor(
    private readonly tasks: ITaskRepository = new PgTaskRepository(),
    private readonly projectService: ProjectService = new ProjectService(),
  ) {}

  async listByProject(projectId: string, ownerId: string): Promise<Task[]> {
    await this.projectService.getOwned(projectId, ownerId);
    return this.tasks.findAllByProject(projectId);
  }

  async create(projectId: string, ownerId: string, data: CreateTaskData): Promise<Task> {
    await this.projectService.getOwned(projectId, ownerId);
    return this.tasks.create(projectId, data);
  }

  async update(taskId: string, ownerId: string, data: UpdateTaskData): Promise<Task> {
    await this.getOwnedTask(taskId, ownerId);
    return this.tasks.update(taskId, data);
  }

  async move(taskId: string, ownerId: string, data: MoveTaskData): Promise<Task> {
    await this.getOwnedTask(taskId, ownerId);
    return this.tasks.move(taskId, data);
  }

  async remove(taskId: string, ownerId: string): Promise<void> {
    await this.getOwnedTask(taskId, ownerId);
    await this.tasks.delete(taskId);
  }

  private async getOwnedTask(taskId: string, ownerId: string): Promise<Task> {
    const task = await this.tasks.findById(taskId);
    if (!task) throw new NotFoundError('Tarea no encontrada');
    await this.projectService.getOwned(task.projectId, ownerId);
    return task;
  }
}
