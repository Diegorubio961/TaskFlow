import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button, Field, Input } from '../../components/ui';
import { getErrorMessage } from '../../api/client';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
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
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setServerError(getErrorMessage(err, 'No se pudo iniciar sesión'));
    }
  });

  return (
    <AuthShell title="Iniciar sesión" subtitle="Accede a tus proyectos y tareas">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Contraseña" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...register('password')} />
        </Field>
        {serverError && <p className="text-sm text-red-400">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
          Regístrate
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-slate-500">
        Demo: demo@gestiontareas.dev / Demo1234!
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <div className="w-full max-w-sm rounded-xl bg-slate-900/80 backdrop-blur border border-slate-700/50 shadow-2xl p-8">
        <div className="mb-6">
          <p className="text-2xl font-bold text-slate-100 mb-1">
            Task<span className="text-indigo-400">Flow</span>
          </p>
          <h1 className="text-base font-semibold text-slate-200">{title}</h1>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
