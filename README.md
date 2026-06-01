# TaskFlow

Aplicación full-stack para gestionar proyectos y tareas mediante un tablero Kanban con drag & drop, fechas de entrega, contador de tiempo por estado y resumen inteligente con IA.

---

## Demo en vivo

Desplegada en una **Raspberry Pi** disponible como servidor, sin necesidad de instalar nada:

**https://riverside-justice-redhead-thinks.trycloudflare.com/**

```
Email:    demo@gestiontareas.dev
Password: Demo1234!
```

> Raspberry Pi OS ARM 32-bit. Los tres contenedores Docker (PostgreSQL, API Node.js y nginx) corren directamente en la Pi.

---

## Alcance actual

### Gestión de proyectos
- Crear, editar y eliminar proyectos
- Cada proyecto tiene nombre y descripción opcional
- Contador de tareas por proyecto en la barra lateral

### Tablero Kanban
- Tres columnas: **Por hacer**, **En progreso**, **Hecho**
- Drag & drop entre columnas con actualización optimista (sin parpadeo)
- Filtro por prioridad y búsqueda por título en tiempo real

### Tareas
- Campos: título, descripción, estado, prioridad (Baja / Media / Alta / Urgente)
- **Fecha de entrega** con badge de color: rojo si venció, ámbar si quedan ≤ 2 días, gris si es futura
- **Contador de tiempo en estado**: muestra cuánto lleva la tarea en su columna actual (ej. `3h`, `5d`, `1sem`)

### Resumen IA ✨
- Botón por proyecto que genera un párrafo ejecutivo en lenguaje natural
- Analiza cantidad de tareas, estado, vencidas y prioridades altas
- Requiere `OPENAI_API_KEY` en el `.env`

### Seguridad y autenticación
- Registro e inicio de sesión con JWT + bcrypt
- Cada usuario solo accede a sus propios proyectos y tareas
- Helmet, CORS restringido, rate-limit en `/auth`

### Diseño responsivo
- Sidebar colapsable con botón hamburger en móvil
- Kanban con scroll horizontal en pantallas pequeñas

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
| IA | OpenAI API (`gpt-4o-mini`) |
| Despliegue | Docker + Docker Compose (imagen ARM para Raspberry Pi) |

Arquitectura del backend por capas: `route → controller → service → repository → PostgreSQL`

---

## Ejecutar con Docker (recomendado)

Requiere Docker y Docker Compose.

```bash
# 1. Copiar y configurar variables de entorno
cp .env.example .env
# Ajustar: POSTGRES_PASSWORD, JWT_SECRET, CORS_ORIGIN
# Opcional para IA: OPENAI_API_KEY=sk-...

# 2. Construir y levantar
docker compose up -d --build
```

- Frontend: http://localhost:8080
- API health: http://localhost:8080/api/health

```bash
docker compose down          # detener (conserva datos)
docker compose logs -f api   # ver logs
```

---

## Ejecutar en local (desarrollo)

Requiere Node.js ≥ 20 y Docker solo para la base de datos.

```bash
# 1. Solo PostgreSQL en Docker
docker compose -f docker-compose.dev.yml up -d

# 2. Backend (terminal 1)
cd backend && npm install && npm run dev
# API en http://localhost:4000

# 3. Frontend (terminal 2)
cd frontend && npm install && npm run dev
# App en http://localhost:5173
```

---

## Variables de entorno

Ver `.env.example`. Las principales:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar los JWT (`openssl rand -hex 48`) |
| `CORS_ORIGIN` | URL del frontend (ej. `http://192.168.1.50:8080`) |
| `WEB_PORT` | Puerto público del frontend (por defecto `8080`) |
| `OPENAI_API_KEY` | API key de OpenAI para el resumen IA (opcional) |

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
