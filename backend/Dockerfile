# ---------- Etapa 1: build ----------
# Usa Debian bullseye en arm/v7 para compatibilidad con Raspbian armhf.
# El cliente Prisma está pre-generado en prisma-client/ (incluye motor WASM,
# independiente de arquitectura). No necesitamos npx prisma generate en Docker.
FROM --platform=linux/arm/v7 node:20-bullseye-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copia el cliente Prisma pre-generado (WASM, sin binarios nativos)
COPY prisma-client ./node_modules/.prisma/client
COPY prisma/schema.prisma ./prisma/schema.prisma

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Etapa 2: runtime ----------
FROM --platform=linux/arm/v7 node:20-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 4000

# runMigrations() en server.ts aplica el esquema SQL al arrancar (sin schema-engine).
CMD ["node", "dist/server.js"]
