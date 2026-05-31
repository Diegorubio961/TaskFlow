import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema, moveTaskSchema, updateTaskSchema } from '../domain/schemas.js';

const tasks = new TaskController();

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateTaskSchema }),
  asyncHandler(tasks.update),
);

// Endpoint específico para el drag & drop del Kanban (cambia estado + posición).
taskRouter.patch(
  '/:id/move',
  validate({ params: idParamSchema, body: moveTaskSchema }),
  asyncHandler(tasks.move),
);

taskRouter.delete('/:id', validate({ params: idParamSchema }), asyncHandler(tasks.remove));
