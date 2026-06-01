/** Controlador de IA — genera resumen ejecutivo de un proyecto. */
import type { Request, Response } from 'express';
import { ProjectService } from '../services/project.service.js';
import { AiService } from '../services/ai.service.js';
import { PgTaskRepository } from '../repositories/task.repository.js';

export class AiController {
  private readonly projects = new ProjectService();
  private readonly ai       = new AiService();
  private readonly tasks    = new PgTaskRepository();

  summarize = async (req: Request, res: Response): Promise<void> => {
    const project = await this.projects.getOwned(req.params.id, req.user!.id);
    const tasks   = await this.tasks.findAllByProject(project.id);
    const summary = await this.ai.summarizeProject(project, tasks);
    res.json({ summary });
  };
}
