/** Hooks de React Query para tareas, con actualización optimista en el move. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi, type TaskPayload } from '../../api/tasks';
import type { Task, TaskStatus } from '../../types';

const tasksKey = (projectId: string) => ['tasks', projectId];

export function useTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: tasksKey(projectId ?? ''),
    queryFn: () => tasksApi.listByProject(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskPayload) => tasksApi.create(projectId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKey(projectId) }),
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TaskPayload> }) =>
      tasksApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKey(projectId) }),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKey(projectId) }),
  });
}

/**
 * Mover una tarea entre columnas. Actualiza la caché de forma optimista para
 * que el Kanban responda al instante; revierte si el servidor falla.
 */
export function useMoveTask(projectId: string) {
  const qc = useQueryClient();
  const key = tasksKey(projectId);

  return useMutation({
    mutationFn: ({ id, status, order }: { id: string; status: TaskStatus; order: number }) =>
      tasksApi.move(id, status, order),
    onMutate: async ({ id, status, order }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Task[]>(key);
      qc.setQueryData<Task[]>(key, (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, status, order } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
