import { api } from './client';
import type { Task, TaskPriority, TaskStatus } from '../types';

export interface TaskPayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export const tasksApi = {
  listByProject: (projectId: string) =>
    api.get<Task[]>(`/projects/${projectId}/tasks`).then((r) => r.data),

  create: (projectId: string, payload: TaskPayload) =>
    api.post<Task>(`/projects/${projectId}/tasks`, payload).then((r) => r.data),

  update: (id: string, payload: Partial<TaskPayload & { order: number }>) =>
    api.patch<Task>(`/tasks/${id}`, payload).then((r) => r.data),

  move: (id: string, status: TaskStatus, order: number) =>
    api.patch<Task>(`/tasks/${id}/move`, { status, order }).then((r) => r.data),

  remove: (id: string) => api.delete(`/tasks/${id}`).then(() => undefined),
};
