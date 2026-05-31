/** Modal para crear o editar un proyecto. */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Field, Input, Modal, Textarea } from '../../components/ui';
import type { Project } from '../../types';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initial?: Project;
  submitting?: boolean;
}

export function ProjectModal({ open, onClose, onSubmit, initial, submitting }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: { name: initial?.name ?? '', description: initial?.description ?? '' },
  });

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar proyecto' : 'Nuevo proyecto'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Nombre" error={errors.name?.message}>
          <Input {...register('name')} autoFocus />
        </Field>
        <Field label="Descripción">
          <Textarea rows={3} {...register('description')} />
        </Field>
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
