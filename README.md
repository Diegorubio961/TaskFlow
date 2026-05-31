# 📋 Gestión de Tareas por Proyectos

Aplicación full‑stack para **gestionar proyectos y sus tareas** mediante un tablero
**Kanban** con arrastrar y soltar, estados y niveles de prioridad. Incluye
autenticación, una API REST documentada y despliegue reproducible con Docker.

> Prueba técnica. El foco está en el **criterio de diseño**: arquitectura por capas,
> principios SOLID, Clean Code, capas de seguridad y una entrega cuidada.

---

## 🧱 Stack y decisiones de diseño

| Capa        | Tecnología                                   | Por qué |
|-------------|----------------------------------------------|---------|
| Frontend    | React 18 + Vite + TypeScript + Tailwind      | DX rápida, tipado, UI moderna |
| Estado/datos| TanStack React Query                         | Caché, sincronización y *optimistic updates* sin Redux |
| Drag & drop | @dnd-kit                                      | Ligero y accesible |
| Backend     | Node + Express + TypeScript                   | Control total para mostrar SOLID por capas |
| ORM / BD    | Prisma + PostgreSQL                           | Migraciones versionadas, type‑safe, relacional |
| Seguridad   | JWT + bcrypt, Helmet, CORS, rate‑limit, Zod  | Defensa en profundidad |
| Despliegue  | Docker + Docker Compose (ARM/Raspberry Pi)    | Reproducible, una sola orden |

### Arquitectura del backend (capas + SOLID)

```
route → controller → service → repository → (Prisma) → PostgreSQL
```

- **Repository**: único punto de acceso a datos. Cada repositorio define una
  **interfaz** (contrato) y su implementación con Prisma → *Dependency Inversion*:
  los servicios dependen de la abstracción, lo que permite **testear sin base de datos**.
- **Service**: lógica de negocio y reglas (incluida la verificación de **propiedad**:
  un usuario solo accede a sus propios recursos). Lanza errores de dominio tipados.
- **Controller**: traduce HTTP ↔ servicio, sin lógica de negocio (*Single Responsibility*).
- **Middlewares**: autenticación JWT, validación con Zod y un *error handler* central
  que convierte errores de dominio en respuestas HTTP coherentes.

### Modelo de datos

```
User (1) ───< (N) Project (1) ───< (N) Task
```

- **User**: `id`, `email` (único), `passwordHash`, `name`.
- **Project**: `id`, `name`, `description?`, `ownerId`. Borrado en cascada de sus tareas.
- **Task**: `id`, `title`, `description?`, `status` (`TODO|IN_PROGRESS|DONE`),
  `priority` (`LOW|MEDIUM|HIGH|URGENT`), `order` (posición en la columna), `dueDate?`.

### Capas de seguridad implementadas

- **Autenticación** con JWT (Bearer) y **hash de contraseñas** con bcrypt.
- **Autorización por propiedad**: 401 sin token, 403 sobre recursos de otro usuario.
- **Validación de entrada** con Zod en cada endpoint (params y body).
- **Helmet** (cabeceras seguras), **CORS** restringido al origen del frontend.
- **Rate limiting** general y reforzado en `/auth` (mitiga fuerza bruta).
- Límite de tamaño del body y manejo de errores sin filtrar el *stack* en producción.

---

## 🚀 Puesta en marcha

### Requisitos
- Node.js ≥ 20 y npm
- Docker (recomendado) **o** una instancia de PostgreSQL

### Opción A — Todo con Docker (la más simple)

```bash
cp .env.example .env        # ajusta POSTGRES_PASSWORD y JWT_SECRET
docker compose up -d --build
docker compose exec api npx prisma db seed   # (opcional) datos demo
```
- Frontend: <http://localhost:8080>
- API: <http://localhost:8080/api/health>

### Opción B — Desarrollo local (BD en Docker, app en tu máquina)

```bash
# 1) Solo la base de datos
docker compose -f docker-compose.dev.yml up -d

# 2) Backend
cd backend
npm install
cp ../.env.example .env       # ajusta DATABASE_URL a localhost (ver comentario en el archivo)
# DATABASE_URL=postgresql://gestor:devpass@localhost:5432/gestiontareas?schema=public
npm run prisma:migrate        # crea las tablas
npm run seed                  # datos demo
npm run dev                   # API en http://localhost:4000

# 3) Frontend (en otra terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173 (proxy /api → :4000)
```

### 🔑 Credenciales demo (tras el seed)
```
Email:    demo@gestiontareas.dev
Password: Demo1234!
```

---

## 🌐 API REST

Base: `/api`. Todas las rutas (salvo `/health` y `/auth/*`) requieren
`Authorization: Bearer <token>`.

| Método | Ruta                              | Descripción |
|--------|-----------------------------------|-------------|
| GET    | `/health`                         | Estado del servicio |
| POST   | `/auth/register`                  | Registro `{ email, name, password }` |
| POST   | `/auth/login`                     | Login `{ email, password }` → `{ token, user }` |
| GET    | `/projects`                       | Lista los proyectos del usuario |
| POST   | `/projects`                       | Crea un proyecto |
| GET    | `/projects/:id`                   | Detalle de un proyecto |
| PATCH  | `/projects/:id`                   | Actualiza un proyecto |
| DELETE | `/projects/:id`                   | Elimina un proyecto (y sus tareas) |
| GET    | `/projects/:projectId/tasks`      | Lista las tareas de un proyecto |
| POST   | `/projects/:projectId/tasks`      | Crea una tarea |
| PATCH  | `/tasks/:id`                      | Actualiza una tarea |
| PATCH  | `/tasks/:id/move`                 | Mueve la tarea (estado + posición) — usado por el Kanban |
| DELETE | `/tasks/:id`                      | Elimina una tarea |

---

## ✅ Tests y calidad

```bash
cd backend
npm test        # Vitest + supertest: lógica de servicios y seguridad de la API
npm run lint    # ESLint
```
Los tests de servicio usan **repositorios en memoria** (dobles), demostrando que
la inversión de dependencias permite probar la lógica **sin base de datos**.

---

## 🐳 Despliegue en Raspberry Pi

Incluye recuperación de acceso SSH y despliegue con Docker Compose:
👉 **[docs/DESPLIEGUE-RASPBERRY.md](docs/DESPLIEGUE-RASPBERRY.md)**

---

## 📁 Estructura del repositorio

```
gestiontareas/
├─ backend/      # API Express + TS (capas), Prisma, tests
├─ frontend/     # React + Vite + TS, Kanban con dnd-kit
├─ docs/         # guía de despliegue en Raspberry Pi
├─ docker-compose.yml       # producción (db + api + web)
├─ docker-compose.dev.yml   # solo PostgreSQL para desarrollo
└─ .env.example
```

---

## 🔧 Variables de entorno

Ver `.env.example`. Las principales:

| Variable           | Descripción |
|--------------------|-------------|
| `DATABASE_URL`     | Cadena de conexión a PostgreSQL |
| `JWT_SECRET`       | Secreto para firmar los JWT (¡genera uno fuerte!) |
| `JWT_EXPIRES_IN`   | Caducidad del token (p. ej. `1d`) |
| `CORS_ORIGIN`      | Origen permitido del frontend |
| `API_PORT`         | Puerto de la API (por defecto 4000) |
| `WEB_PORT`         | Puerto público del frontend (por defecto 8080) |
