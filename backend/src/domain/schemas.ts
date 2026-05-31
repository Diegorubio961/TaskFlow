/** Esquemas de validación zod para los payloads de la API. */
import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'El nombre es obligatorio').max(120),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().uuid('Identificador de proyecto inválido'),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(120),
  description: z.string().max(2000).optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

const taskBase = {
  title: z.string().min(1, 'El título es obligatorio').max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.coerce.date().optional().nullable(),
};

export const createTaskSchema = z.object(taskBase);
export const updateTaskSchema = z
  .object({ ...taskBase, order: z.number().int().min(0) })
  .partial();

export const moveTaskSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  order: z.number().int().min(0),
});
