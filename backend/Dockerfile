# ---------- Etapa 1: build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependencias (incluye dev para compilar TS y generar Prisma).
COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Etapa 2: runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Solo dependencias de producción.
COPY package*.json ./
RUN npm ci --omit=dev

# Cliente Prisma generado, esquema/migraciones y código compilado.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY --from=builder /app/dist ./dist

# Usuario sin privilegios.
USER node

EXPOSE 4000

# Aplica migraciones pendientes y arranca. (prisma migrate deploy es idempotente.)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
