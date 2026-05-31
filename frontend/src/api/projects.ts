import { api } from './client';
import type { Project } from '../types';

export interface ProjectPayload {
  name: string;
  description?: string | null;
}

export const projectsApi = {
  list: () => api.get<Project[]>('/projects').then((r) => r.data),

  create: (payload: ProjectPayload) =>
    api.post<Project>('/projects', payload).then((r) => r.data),

  update: (id: string, payload: Partial<ProjectPayload>) =>
    api.patch<Project>(`/projects/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/projects/${id}`).then(() => undefined),
};
