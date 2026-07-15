#!/bin/bash
set -euo pipefail

# ============================================================
# MG Support Tech — Setup inicial del servidor Oracle Cloud
# Ejecutar como root: sudo bash setup.sh
# ============================================================

DOMAIN="${1:-}"  # Opcional: pasa tu dominio como argumento
APP_USER="ubuntu"
APP_DIR="/home/$APP_USER/mg-support-tech"

echo "========================================"
echo "  MG Support Tech — Setup del servidor"
echo "========================================"

# ─── 1. Actualizar sistema ───
echo "[1/8] Actualizando sistema..."
apt update && apt upgrade -y

# ─── 2. Instalar Docker ───
echo "[2/8] Instalando Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | bash
  usermod -aG docker "$APP_USER"
  systemctl enable docker
fi

# ─── 3. Instalar Docker Compose plugin ───
echo "[3/8] Instalando Docker Compose..."
if ! command -v docker-compose &>/dev/null && ! docker compose version &>/dev/null; then
  apt install -y docker-compose-v2
fi

# ─── 4. Instalar Nginx ───
echo "[4/8] Instalando Nginx..."
apt install -y nginx
systemctl enable nginx

# ─── 5. Configurar firewall (UFW) ───
echo "[5/8] Configurando firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw --force enable

# ─── 6. Configurar Nginx como reverse proxy ───
echo "[6/8] Configurando Nginx..."
cat > /etc/nginx/sites-available/mg-support << 'NGINX'
server {
    listen 80;
    server_name _;
    client_max_body_size 10M;

    # Frontend (Next.js SSR)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API (NestJS)
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket (Socket.io)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
NGINX

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/mg-support /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# ─── 7. SSL con Let's Encrypt (si se proporcionó dominio) ───
if [ -n "$DOMAIN" ]; then
  echo "[7/8] Instalando SSL para $DOMAIN..."
  apt install -y certbot python3-certbot-nginx
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || {
    echo "  ⚠️  Certbot falló. Puedes ejecutarlo manualmente después:"
    echo "     sudo certbot --nginx -d $DOMAIN"
  }

  # Renovación automática
  systemctl enable certbot.timer || true
else
  echo "[7/8] Omitiendo SSL (sin dominio). Configúralo después con:"
  echo "     sudo certbot --nginx -d tudominio.com"
fi

# ─── 8. Crear directorio de la app ───
echo "[8/8] Preparando directorio de la app..."
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo ""
echo "========================================"
echo "  ✅ Setup completado"
echo "========================================"
echo ""
echo "  Próximos pasos:"
echo "  1. Sube tu código al servidor:"
echo "     rsync -avz --exclude 'node_modules' --exclude '.env' ./ $APP_USER@IP:$APP_DIR/"
echo ""
echo "  2. Crea el archivo .env en $APP_DIR/backend/"
echo "     cp backend/.env.example backend/.env"
echo "     # Edita MONGODB_URI y JWT_SECRET"
echo ""
echo "  3. Inicia la aplicación:"
echo "     cd $APP_DIR"
echo "     docker compose up -d"
echo ""
echo "  4. Ejecuta el seed:"
echo "     docker compose exec backend node scripts/seed.js"
echo ""
echo "  Tu app estará en: http://$([ -n "$DOMAIN" ] && echo "$DOMAIN" || echo "IP_DEL_SERVIDOR")"
echo "========================================"
