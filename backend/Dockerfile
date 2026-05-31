# ---------- Etapa 1: build ----------
# Usa Debian bullseye (glibc) en arm/v7 para compatibilidad con Raspbian armhf.
# driverAdapters en schema.prisma evita que Prisma descargue binarios nativos.
FROM --platform=linux/arm/v7 node:20-bullseye-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
# Fuerza descarga del binario x86 Alpine (existe en Prisma 5.x).
# En runtime, driverAdapters en prisma.ts lo bypassa: nunca se ejecuta.
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x
RUN npx prisma generate

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
