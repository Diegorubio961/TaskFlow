import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { AuthShell } from './LoginPage';
import { Button, Field, Input } from '../../components/ui';
import { getErrorMessage } from '../../api/client';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    setServerError('');
    try {
      await signup(data.email, data.name, data.password);
      navigate('/');
    } catch (err) {
      setServerError(getErrorMessage(err, 'No se pudo crear la cuenta'));
    }
  });

  return (
    <AuthShell title="Crear cuenta" subtitle="Empieza a organizar tus proyectos">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nombre" error={errors.name?.message}>
          <Input type="text" autoComplete="name" {...register('name')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Contraseña" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creando…' : 'Registrarme'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
