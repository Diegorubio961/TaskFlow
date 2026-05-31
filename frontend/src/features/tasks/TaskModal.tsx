/** Modal para crear o editar una tarea. */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Field, Input, Modal, Textarea } from '../../components/ui';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '../../types';

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const schema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initial?: Task;
  defaultStatus?: TaskStatus;
  submitting?: boolean;
}

export function TaskModal({ open, onClose, onSubmit, initial, defaultStatus, submitting }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      status: initial?.status ?? defaultStatus ?? 'TODO',
      priority: initial?.priority ?? 'MEDIUM',
    },
  });

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar tarea' : 'Nueva tarea'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Título" error={errors.title?.message}>
          <Input {...register('title')} autoFocus />
        </Field>
        <Field label="Descripción">
          <Textarea rows={3} {...register('description')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Estado">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              {...register('status')}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Prioridad">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              {...register('priority')}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
