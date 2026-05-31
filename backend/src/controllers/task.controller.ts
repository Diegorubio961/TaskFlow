/** Controlador de tareas. */
import type { Request, Response } from 'express';
import { TaskService } from '../services/task.service.js';

export class TaskController {
  constructor(private readonly service: TaskService = new TaskService()) {}

  listByProject = async (req: Request, res: Response): Promise<void> => {
    const tasks = await this.service.listByProject(req.params.projectId, req.user!.id);
    res.json(tasks);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.create(req.params.projectId, req.user!.id, req.body);
    res.status(201).json(task);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.update(req.params.id, req.user!.id, req.body);
    res.json(task);
  };

  move = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.move(req.params.id, req.user!.id, req.body);
    res.json(task);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(req.params.id, req.user!.id);
    res.status(204).send();
  };
}
