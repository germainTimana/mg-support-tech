#!/bin/bash
set -euo pipefail

# ============================================================
# MG Support Tech — Script de deploy/actualización
# Uso: bash deploy.sh
# ============================================================

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "========================================"
echo "  MG Support Tech — Deploy"
echo "========================================"

# ─── 1. Verificar .env ───
if [ ! -f backend/.env ]; then
  echo "❌ backend/.env no encontrado. Cópialo desde .env.example"
  echo "   cp backend/.env.example backend/.env"
  echo "   Luego edita MONGODB_URI y JWT_SECRET"
  exit 1
fi

# ─── 2. Pull de cambios (si hay git) ───
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "[1/4] Actualizando código desde git..."
  git pull origin main
fi

# ─── 3. Construir y levantar contenedores ───
echo "[2/4] Construyendo imágenes..."
docker compose build --pull

echo "[3/4] Levantando servicios..."
docker compose up -d

# ─── 4. Limpiar imágenes antiguas ───
echo "[4/4] Limpiando imágenes no usadas..."
docker image prune -f

echo ""
echo "✅ Deploy completado"
echo "   Servicios activos:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
