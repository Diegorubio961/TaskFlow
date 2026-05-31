# 🖥️ Guía de ejecución en local (Windows)

Tres caminos según lo que prefieras instalar. **Necesitas una base de datos
PostgreSQL** de alguna forma (ahora mismo no tienes ni Docker ni Postgres instalados).

| Camino | Requiere instalar | Cuándo usarlo |
|--------|-------------------|---------------|
| **A — Todo con Docker** | Docker Desktop | Lo más simple, "todo levanta solo" |
| **B — Dev (recomendado para programar)** | Docker Desktop | Hot-reload del código; BD en Docker, app con npm |
| **C — Sin Docker** | PostgreSQL para Windows | Si no quieres/puedes usar Docker |

> Node 20 y npm ya los tienes. Las dependencias (`npm install`) ya están instaladas en
> `backend/` y `frontend/` de cuando construimos el proyecto.

---

## Camino A — Todo con Docker (lo más simple)

1. Instala **Docker Desktop**: <https://www.docker.com/products/docker-desktop/>
   (tras instalar, ábrelo una vez y espera a que diga "Engine running").
2. En la raíz del proyecto, crea el `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
   Edita `.env` y pon una `JWT_SECRET` cualquiera larga y una `POSTGRES_PASSWORD`.
   Para este camino, deja `DATABASE_URL` con el host `db` (el valor por defecto).
3. Levanta todo:
   ```powershell
   docker compose up -d --build
   ```
4. Carga datos demo (opcional):
   ```powershell
   docker compose exec api npx prisma db seed
   ```
5. Abre **http://localhost:8080** e inicia sesión con `demo@gestiontareas.dev / Demo1234!`

Parar / borrar:
```powershell
docker compose down        # parar (mantiene los datos)
docker compose down -v     # parar y borrar la base de datos
```

---

## Camino B — Desarrollo con hot-reload (recomendado para tocar código)

Aquí solo la **base de datos** corre en Docker; el backend y el frontend corren con
`npm` para ver los cambios al instante.

### 1. Levanta solo PostgreSQL
```powershell
docker compose -f docker-compose.dev.yml up -d
```
Esto crea Postgres en `localhost:5432` con usuario `gestor`, clave `devpass`, BD `gestiontareas`.

### 2. Configura el backend
```powershell
cd backend
Copy-Item ..\.env.example .env
```
Edita `backend\.env` y deja **estas** líneas así (host `localhost`, no `db`):
```
DATABASE_URL=postgresql://gestor:devpass@localhost:5432/gestiontareas?schema=public
JWT_SECRET=cualquier_secreto_largo_para_desarrollo_123456
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
API_PORT=4000
```

### 3. Crea las tablas y datos demo, y arranca la API
```powershell
npm run prisma:migrate    # crea las tablas (la primera vez te pedirá un nombre, p.ej. "init")
npm run seed              # usuario y proyectos demo
npm run dev               # API en http://localhost:4000
```
Deja esta terminal abierta.

### 4. En OTRA terminal, arranca el frontend
```powershell
cd frontend
npm run dev               # http://localhost:5173
```
El frontend redirige `/api` al backend (`:4000`) automáticamente (proxy de Vite).

### 5. Abre **http://localhost:5173**
Login con `demo@gestiontareas.dev / Demo1234!` (o regístrate).

---

## Camino C — Sin Docker (PostgreSQL nativo en Windows)

1. Instala **PostgreSQL** para Windows: <https://www.postgresql.org/download/windows/>
   (durante la instalación define una contraseña para el usuario `postgres`).
2. Crea la base de datos (con la herramienta **pgAdmin** que viene incluida, o por consola):
   ```sql
   CREATE DATABASE gestiontareas;
   ```
3. Configura `backend\.env` con tu conexión real, por ejemplo:
   ```
   DATABASE_URL=postgresql://postgres:TU_CLAVE@localhost:5432/gestiontareas?schema=public
   JWT_SECRET=cualquier_secreto_largo_para_desarrollo_123456
   CORS_ORIGIN=http://localhost:5173
   ```
4. Sigue los pasos 3, 4 y 5 del **Camino B** (migrate, seed, `npm run dev` en backend y frontend).

---

## ✅ Checklist de prueba (qué demostrar)

1. **Registro / login** → entras al tablero.
2. **Crear un proyecto** desde la barra lateral (botón `+`).
3. **Crear tareas** con distintas prioridades y estados.
4. **Arrastrar una tarjeta** de "Por hacer" a "En progreso" → se mueve al instante.
5. **Recargar la página (F5)** → la tarjeta sigue en su nueva columna (persistió en BD).
6. **Filtrar** por prioridad y **buscar** por texto.
7. **Seguridad**: abre las DevTools (F12) → pestaña Network → mira que las llamadas a
   `/api` llevan la cabecera `Authorization: Bearer ...`.

---

## 🛠️ Problemas comunes

| Síntoma | Causa / solución |
|---------|------------------|
| `Can't reach database server` | Postgres no está levantado o `DATABASE_URL` apunta a `db` en vez de `localhost` |
| La API no arranca y se queja de `JWT_SECRET` | Falta o es muy corta en `.env` (mínimo 16 caracteres) |
| El front carga pero el login falla con error de red | El backend no está corriendo en `:4000`, o no ejecutaste el seed/registro |
| `port 5432 already in use` | Ya tienes otro Postgres ocupando el puerto; párelo o cambia el puerto |
| Cambié código y no se refleja | En Camino A reconstruye: `docker compose up -d --build`. En Camino B el hot-reload es automático |
