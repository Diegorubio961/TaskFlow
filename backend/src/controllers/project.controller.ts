/** Controlador de proyectos. El ownerId proviene del JWT (req.user). */
import type { Request, Response } from 'express';
import { ProjectService } from '../services/project.service.js';

export class ProjectController {
  constructor(private readonly service: ProjectService = new ProjectService()) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const projects = await this.service.list(req.user!.id);
    res.json(projects);
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const project = await this.service.getOwned(req.params.id, req.user!.id);
    res.json(project);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const project = await this.service.create(req.user!.id, req.body);
    res.status(201).json(project);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const project = await this.service.update(req.params.id, req.user!.id, req.body);
    res.json(project);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(req.params.id, req.user!.id);
    res.status(204).send();
  };
}
