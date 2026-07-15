# MG Support Tech

Sistema full-stack de **recepción y entrega de computadores** con autenticación por roles, tablero Kanban en tiempo real y pagos vía B-Bre / Nequi.

## Arquitectura

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| Backend | NestJS (API REST + WebSockets) |
| Base de datos | MongoDB Atlas (Mongoose) |
| Tiempo real | Socket.io (namespace `/kanban`) |

## Roles

- **Administrador**: registra clientes/técnicos, recepciona equipos, crea servicios y asigna técnico.
- **Técnico**: tablero Kanban con drag & drop (Pendiente → En reparación → Listo → Entregado).
- **Cliente**: consulta servicios por código, ve observaciones por fase y paga cuando el servicio está **Listo**.

## Requisitos

- **Node.js 18+** (recomendado 20 LTS)
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)

## Configuración

### 1. MongoDB Atlas

1. Cree un cluster gratuito en Atlas.
2. Usuario de base de datos con contraseña.
3. Acceso de red: agregue su IP (o `0.0.0.0/0` solo para desarrollo).
4. Copie la URI de conexión.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edite MONGODB_URI y JWT_SECRET
npm install
npm run seed    # Crea admin inicial
npm run start:dev
```

API en `http://localhost:4000/api`

**Usuario demo:** `admin@mgsupport.com` / `admin123`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# Misma JWT_SECRET que el backend
npm install
npm run dev
```

App en `http://localhost:3000`

## Rutas API Next.js (proxy protegido por rol)

| Ruta | Descripción | Roles |
|------|-------------|-------|
| `POST /api/auth/login` | Login | Público |
| `GET/POST /api/users` | Usuarios | Admin |
| `GET/POST /api/platos` | Equipos recibidos | Admin / Técnico |
| `GET /api/pedidos` | Pedidos (servicios) | Todos autenticados |
| `GET/POST /api/servicios` | Servicios | Según rol |
| `GET /api/servicios/kanban` | Tablero Kanban | Todos autenticados |
| `PATCH /api/servicios/[id]` | Cambiar estado | Admin / Técnico |
| `POST /api/pagos` | Registrar pago | Cliente / Admin |

## Flujo de negocio

1. Admin registra **cliente** y **técnico**.
2. Admin **recibe el equipo** (marca, modelo, problema).
3. Admin crea **servicio** → estado **Pendiente**, código único `MGS-XXXX`.
4. Técnico mueve tarjetas en el Kanban; agrega observaciones por fase.
5. Cliente sigue el tablero y consulta por código.
6. En columna **Listo**, cliente paga con **Nequi** o **B-Bre**.
7. Tras pago, admin/técnico puede mover a **Entregado**.

## Estructura del proyecto

```
pruebasupport/
├── .github/workflows/    # CI/CD (GitHub Actions)
├── backend/              # NestJS + Mongoose + Socket.io
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── equipos/      # + alias /platos
│       ├── servicios/    # + alias /pedidos
│       ├── pagos/
│       └── events/       # WebSocket gateway
├── deploy/               # Scripts de deploy para Oracle Cloud
│   ├── setup.sh          #   Instalación del servidor
│   ├── deploy.sh         #   Actualización manual
│   ├── nginx.conf        #   Configuración Nginx
│   └── docker-compose.prod.yml
├── frontend/             # Next.js App Router
│   └── src/
│       ├── app/
│       │   ├── admin/
│       │   ├── tecnico/
│       │   ├── cliente/
│       │   └── api/      # Proxy con guards de rol
│       └── components/   # Kanban, modales, etc.
├── .env.production.example
├── docker-compose.yml
```

## Despliegue con Docker (local)

```bash
# 1. Configure backend/.env con su MONGODB_URI y JWT_SECRET
cp backend/.env.example backend/.env
# Edite MONGODB_URI y JWT_SECRET

# 2. Inicie los servicios
docker compose up -d

# 3. Ejecute el seed para crear usuarios demo
docker compose exec backend node scripts/seed.js
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000/api`

**Usuario demo:** `admin@mgsupport.com` / `admin123`

---

## Despliegue en Oracle Cloud (Always Free)

### Requisitos

- Cuenta en [Oracle Cloud Free Tier](https://signup.cloud.oracle.com/)
- Una VM **Ampere A1** (ARM, 2 OCPU, 12GB RAM) — Always Free
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (cluster M0 gratis)
- Un dominio (opcional, para HTTPS con Let's Encrypt)

### Paso 1: Crear la VM en Oracle Cloud

1. Ingresa a [Oracle Cloud Console](https://cloud.oracle.com)
2. Menú → **Compute** → **Instances** → **Create Instance**
3. Configura:
   - **Name**: `mg-support-tech`
   - **Image**: Canonical Ubuntu 24.04 LTS (ARM64)
   - **Shape**: VM.Standard.A1.Flex — **2 OCPU, 12 GB RAM** (Always Free)
   - **SSH Keys**: Sube tu clave pública o descarga la generada
4. En **Networking** → crea una VCN nueva con subred pública
5. Click **Create** y espera a que la VM esté activa

### Paso 2: Abrir puertos en el firewall de Oracle

1. Menú → **Networking** → **Virtual Cloud Networks**
2. Selecciona la VCN de tu VM
3. **Security Lists** → **Default Security List**
4. Agrega estas **Ingress Rules**:

| Source Type | Source | IP Protocol | Source Port Range | Destination Port Range |
|-------------|--------|-------------|-------------------|------------------------|
| CIDR | `0.0.0.0/0` | TCP | All | `22` (SSH) |
| CIDR | `0.0.0.0/0` | TCP | All | `80` (HTTP) |
| CIDR | `0.0.0.0/0` | TCP | All | `443` (HTTPS) |

### Paso 3: Conectarte por SSH y ejecutar setup

```bash
# Conéctate a tu VM
ssh -i ~/.ssh/tu-key.pem ubuntu@IP_DEL_SERVIDOR

# Descarga el setup y ejecútalo (como root)
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/deploy/setup.sh)" -- tudominio.com
```

> Si no tienes dominio aún: `sudo bash setup.sh` (sin argumentos).

Este script automatiza:
- Instalación de Docker + Docker Compose
- Configuración de Nginx como reverse proxy
- Configuración del firewall (UFW)
- SSL con Let's Encrypt (si proporcionaste dominio)
- Preparación del directorio de la app

### Paso 4: Subir el código y configurar

```bash
# Desde tu máquina local, sube el proyecto
rsync -avz --exclude 'node_modules' --exclude '.env' --exclude '.next' --exclude 'dist' \
  ./ ubuntu@IP_DEL_SERVIDOR:~/mg-support-tech/

# Conéctate al servidor
ssh ubuntu@IP_DEL_SERVIDOR

# Configura las variables de entorno
cd ~/mg-support-tech
cp .env.production.example backend/.env
nano backend/.env   # Edita MONGODB_URI y JWT_SECRET
```

### Paso 5: Iniciar la aplicación

```bash
cd ~/mg-support-tech

# Construir y levantar contenedores
docker compose up -d --build

# Ejecutar seed (solo la primera vez)
docker compose exec backend node scripts/seed.js

# Verificar que todo esté corriendo
docker compose ps
```

### Paso 6: Verificar funcionamiento

- Abre `http://IP_DEL_SERVIDOR` en el navegador
- Inicia sesión con `admin@mgsupport.com` / `admin123`
- Prueba el WebSocket abriendo el tablero Kanban en `/admin`

### Actualizar después de cambios

```bash
# Opción 1: Manual (SSH al servidor)
cd ~/mg-support-tech
git pull origin main
docker compose up -d --build
docker image prune -f

# Opción 2: Automático (GitHub Actions)
# Configura los secrets en GitHub:
#   Settings → Secrets → Actions → New repository secret
#   - HOST: IP del servidor
#   - USERNAME: ubuntu
#   - SSH_KEY: contenido completo de tu clave privada
# Luego cada push a main desplegará automáticamente
```

### Estructura de archivos de deploy

```
deploy/
├── setup.sh                   # Script de instalación del servidor
├── deploy.sh                  # Script de actualización manual
├── nginx.conf                 # Configuración Nginx (referencia)
└── docker-compose.prod.yml    # Override para producción

.github/workflows/deploy.yml   # CI/CD con GitHub Actions
.env.production.example        # Plantilla de variables de producción
```

---

## Variables de entorno

### Backend (`backend/.env`)

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=clave-secreta-compartida
JWT_EXPIRES_IN=7d
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=http://localhost:4000
JWT_SECRET=clave-secreta-compartida
```

> **Importante:** `JWT_SECRET` debe ser idéntico en backend y frontend para que el middleware valide las cookies.

## Licencia

Proyecto de demostración — MG Support Tech.
