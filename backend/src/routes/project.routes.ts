import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import {
  createProjectSchema,
  createTaskSchema,
  idParamSchema,
  projectIdParamSchema,
  updateProjectSchema,
} from '../domain/schemas.js';

const projects = new ProjectController();
const tasks = new TaskController();

export const projectRouter = Router();

// Todas las rutas de proyectos requieren autenticación.
projectRouter.use(authenticate);

projectRouter.get('/', asyncHandler(projects.list));

projectRouter.post(
  '/',
  validate({ body: createProjectSchema }),
  asyncHandler(projects.create),
);

projectRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(projects.get));

projectRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateProjectSchema }),
  asyncHandler(projects.update),
);

projectRouter.delete('/:id', validate({ params: idParamSchema }), asyncHandler(projects.remove));

// --- Tareas anidadas bajo un proyecto ---
projectRouter.get(
  '/:projectId/tasks',
  validate({ params: projectIdParamSchema }),
  asyncHandler(tasks.listByProject),
);

projectRouter.post(
  '/:projectId/tasks',
  validate({ params: projectIdParamSchema, body: createTaskSchema }),
  asyncHandler(tasks.create),
);
