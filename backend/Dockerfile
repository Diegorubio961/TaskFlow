# ---------- Etapa 1: build ----------
# Usa Debian bullseye en arm/v7 para compatibilidad con Raspbian armhf.
# Sin Prisma Client en runtime: solo pg (JavaScript puro), sin binarios nativos.
FROM --platform=linux/arm/v7 node:20-bullseye-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Etapa 2: runtime ----------
FROM --platform=linux/arm/v7 node:20-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

USER node
EXPOSE 4000

# runMigrations() en server.ts crea el esquema SQL al arrancar (idempotente).
CMD ["node", "dist/server.js"]
