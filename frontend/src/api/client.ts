/**
 * Cliente axios central. Un interceptor añade el JWT a cada petición y otro
 * gestiona el 401 (token inválido/expirado) cerrando la sesión.
 */
import axios from 'axios';

const TOKEN_KEY = 'gt_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Permite que el AuthContext registre una acción de logout ante un 401.
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Extrae un mensaje de error legible de la respuesta de la API. */
export const getErrorMessage = (error: unknown, fallback = 'Ha ocurrido un error'): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? fallback;
  }
  return fallback;
};
