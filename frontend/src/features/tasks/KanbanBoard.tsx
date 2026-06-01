/**
 * Tablero Kanban completo. Orquesta el drag & drop con dnd-kit, los filtros por
 * prioridad/texto y los modales de creación/edición de tareas.
 */
import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
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
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === String(event.active.id));
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = String(active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const targetStatus = over.id as TaskStatus;
    if (!STATUS_ORDER.includes(targetStatus)) return;
    if (targetStatus === task.status) return;

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
      {/* Barra de filtros — responsiva */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="flex-1 min-w-[140px]"
          placeholder="Buscar por título…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="flex-1 min-w-[140px] rounded-lg bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
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
        <Button onClick={() => openCreate('TODO')} className="w-full sm:w-auto">
          + Nueva tarea
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Columnas: scroll horizontal en móvil, grid en desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="min-w-[280px] shrink-0 md:min-w-0">
              <KanbanColumn
                status={status}
                tasks={byStatus(status)}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="bg-slate-800 border border-indigo-500 rounded-xl p-3 shadow-2xl opacity-95 rotate-1 cursor-grabbing">
              <p className="text-slate-100 text-sm font-medium">{activeTask.title}</p>
              <span
                className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[activeTask.priority]}`}
              >
                {PRIORITY_LABELS[activeTask.priority]}
              </span>
            </div>
          )}
        </DragOverlay>
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
