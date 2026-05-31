/**
 * Tablero Kanban completo. Orquesta el drag & drop con dnd-kit, los filtros por
 * prioridad/texto y los modales de creación/edición de tareas.
 */
import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  PRIORITY_LABELS,
  STATUS_ORDER,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '../../types';
import {
  useCreateTask,
  useDeleteTask,
  useMoveTask,
  useTasks,
  useUpdateTask,
} from './useTasks';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { Button, Input, Spinner } from '../../components/ui';

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: tasks = [], isLoading } = useTasks(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const moveTask = useMoveTask(projectId);

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [newStatus, setNewStatus] = useState<TaskStatus>('TODO');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (!priorityFilter || t.priority === priorityFilter) &&
          t.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [tasks, priorityFilter, search],
  );

  const byStatus = (status: TaskStatus) =>
    filtered.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // El destino puede ser una columna (id = status) o una tarjeta (usamos su status).
    const overData = over.data.current as { status?: TaskStatus } | undefined;
    const targetStatus = (STATUS_ORDER.includes(over.id as TaskStatus)
      ? (over.id as TaskStatus)
      : overData?.status) as TaskStatus | undefined;

    if (!targetStatus || targetStatus === task.status) return;

    const order = byStatus(targetStatus).length;
    moveTask.mutate({ id: taskId, status: targetStatus, order });
  };

  const openCreate = (status: TaskStatus) => {
    setEditing(undefined);
    setNewStatus(status);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      deleteTask.mutate(task.id);
    }
  };

  if (isLoading) return <Spinner label="Cargando tareas…" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-56">
          <Input
            placeholder="Buscar por título…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
        >
          <option value="">Todas las prioridades</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <Button onClick={() => openCreate('TODO')} className="ml-auto">
          + Nueva tarea
        </Button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={byStatus(status)}
              onAdd={openCreate}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DndContext>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        defaultStatus={newStatus}
        submitting={createTask.isPending || updateTask.isPending}
        onSubmit={(data) => {
          if (editing) {
            updateTask.mutate({ id: editing.id, payload: data });
          } else {
            createTask.mutate(data);
          }
          setModalOpen(false);
        }}
      />
    </div>
  );
}
