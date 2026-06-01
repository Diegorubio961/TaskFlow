# TaskFlow

Aplicación full-stack para gestionar proyectos y tareas mediante un tablero **Kanban** con drag & drop, fechas de entrega y contador de tiempo por estado.

---

## Demo en vivo

Para probar la aplicación sin instalar nada, está desplegada en una **Raspberry Pi** disponible como servidor:

**https://riverside-justice-redhead-thinks.trycloudflare.com**

```
Email:    demo@gestiontareas.dev
Password: Demo1234!
```

> La Raspberry Pi corre Raspberry Pi OS (ARM 32-bit). Los contenedores Docker están compilados para esa arquitectura — PostgreSQL, la API Node.js y el frontend nginx corren directamente en la Pi sin capa de virtualización adicional.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Estado del servidor | TanStack React Query (caché + optimistic updates) |
| Drag & drop | @dnd-kit |
| Backend | Node.js + Express + TypeScript |
| Base de datos | PostgreSQL (driver `pg` nativo, sin ORM en runtime) |
| Esquema / tipos | Prisma (solo para migraciones y generación de tipos) |
| Validación | Zod (frontend y backend) |
| Autenticación | JWT + bcrypt |
| Seguridad | Helmet, CORS, rate-limit |
| Despliegue | Docker + Docker Compose (imagen ARM para Raspberry Pi) |

Arquitectura del backend por capas: `route → controller → service → repository → PostgreSQL`

---

## Ejecutar con Docker (recomendado)

Requiere Docker y Docker Compose.

```bash
# 1. Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env: ajustar POSTGRES_PASSWORD, JWT_SECRET y CORS_ORIGIN

# 2. Construir y levantar
docker compose up -d --build

# 3. (Opcional) cargar datos de demo
docker compose exec api node dist/seed.js
```

- Frontend: http://localhost:8080
- API health: http://localhost:8080/api/health

```bash
# Detener (conserva los datos)
docker compose down

# Ver logs
docker compose logs -f api
```

---

## Ejecutar en local (desarrollo)

Requiere Node.js ≥ 20 y Docker solo para la base de datos.

```bash
# 1. Levantar solo PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# 2. Backend (terminal 1)
cd backend
npm install
cp ../.env.example .env
# En .env cambiar DATABASE_URL a: postgresql://gestor:devpass@localhost:5432/gestiontareas
npm run dev
# API disponible en http://localhost:4000

# 3. Frontend (terminal 2)
cd frontend
npm install
npm run dev
# App disponible en http://localhost:5173
```

### Credenciales demo

```
Email:    demo@gestiontareas.dev
Password: Demo1234!
```

---

## Variables de entorno

Ver `.env.example`. Las principales:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar los JWT (generar con `openssl rand -hex 48`) |
| `CORS_ORIGIN` | URL del frontend (ej. `http://192.168.1.50:8080`) |
| `WEB_PORT` | Puerto público del frontend (por defecto `8080`) |
| `JWT_EXPIRES_IN` | Caducidad del token (por defecto `1d`) |

---

## Estructura

```
taskflow/
├── backend/     # API Express + TypeScript (controller / service / repository)
├── frontend/    # React + Vite + Tailwind, Kanban con dnd-kit
├── docs/        # Guía de despliegue en Raspberry Pi
├── docker-compose.yml      # producción (db + api + web)
├── docker-compose.dev.yml  # solo PostgreSQL para desarrollo local
└── .env.example
```
