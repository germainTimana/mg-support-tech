# ---- Etapa de build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependencias (incluye devDependencies para compilar)
COPY package*.json ./
RUN npm ci

# Copia el código fuente y compila
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- Etapa de producción ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Artefactos compilados y scripts (seed)
COPY --from=builder /app/dist ./dist
COPY scripts ./scripts

EXPOSE 4000
CMD ["node", "dist/main"]
