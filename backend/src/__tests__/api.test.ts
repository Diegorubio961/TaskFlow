/**
 * Tests de integración HTTP con supertest. Cubren las capas que NO requieren
 * base de datos viva: healthcheck, validación de payloads (400) y protección
 * de rutas por JWT (401). Demuestran las capas de seguridad de la API.
 */
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('API — salud y seguridad', () => {
  it('GET /api/health responde 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/projects sin token responde 401', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/auth/register con email inválido responde 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'no-es-email', name: 'X', password: 'Password123' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('POST /api/auth/login con body incompleto responde 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  it('GET de ruta inexistente responde 404', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('incluye cabeceras de seguridad de helmet', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
