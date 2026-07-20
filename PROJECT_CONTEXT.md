# PROJECT_CONTEXT.md

> Memoria persistente del proyecto. Consulta este archivo antes de cualquier sesión para evitar re-analizar todo el código.
> Última actualización: 2026-07-19

## Resumen ejecutivo

**MG Support Tech** es un sistema full-stack para la **recepción y entrega de computadores** (taller de reparación). Soporta 3 roles (Administrador, Técnico, Cliente), tablero Kanban en tiempo real (drag & drop) y pagos. Es un proyecto de demostración pero con estructura de producción (Docker, Nginx, CI/CD en Oracle Cloud).

## Objetivo del proyecto

Gestionar el ciclo de vida de un servicio de reparación: recepción de equipo → asignación de técnico → seguimiento por Kanban → pago → entrega.

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Next.js (App Router) + React 19 | ^15.1.3 |
| UI | Tailwind CSS | ^3.4.17 |
| Estado/Kanban | @dnd-kit | 6.x |
| Auth cliente | `jose` (JWT verify en edge) | ^5.9.6 |
| Tiempo real | socket.io-client | ^4.8.1 |
| Backend | NestJS (API REST + WebSockets) | ^10.4.15 |
| ORM | Mongoose | ^8.9.3 |
| DB | MongoDB Atlas | - |
| Auth backend | @nestjs/jwt + passport-jwt + bcryptjs | - |
| Validación | class-validator / class-transformer | - |
| Proxy inverso | Nginx | - |
| Contenedores | Docker Compose | - |
| CI/CD | GitHub Actions → SSH a Oracle Cloud | - |

## Estructura de carpetas

```
pruebasupport/
├── .github/workflows/deploy.yml   # CI/CD
├── backend/                        # NestJS
│   ├── src/
│   │   ├── auth/                   # login, JWT strategy, guards
│   │   ├── users/                  # CRUD usuarios
│   │   ├── equipos/                # + alias /platos (equipos recibidos)
│   │   ├── servicios/              # + alias /pedidos (servicios)
│   │   ├── pagos/                  # pagos Nequi/B-Bre
│   │   ├── events/                 # WebSocket gateway (/kanban)
│   │   ├── health/                 # healthcheck
│   │   └── common/                 # enums, decorators, roles guard
│   ├── scripts/seed.js             # seed admin demo
│   └── Dockerfile
├── frontend/                       # Next.js
│   └── src/
│       ├── app/
│       │   ├── admin/ tecnico/ cliente/ login/   # páginas por rol
│       │   └── api/               # proxy routes con guards de rol
│       ├── components/            # Kanban, modales
│       ├── i18n/                  # es, en, fr, pt
│       └── lib/                   # api.ts, auth.ts, api-auth.ts, types.ts
├── deploy/                         # setup.sh, deploy.sh, nginx.conf, docker-compose.prod.yml
├── docker-compose.yml              # local
└── .env.production.example
```

## Componentes principales

- **Frontend (Next.js App Router)**: páginas protegidas por rol vía `middleware.ts` (edge, valida JWT con `jose`). Las rutas `/api/*` actúan como proxy hacia el backend NestJS, seteando la cookie `token` (httpOnly).
- **Backend (NestJS)**: API REST bajo prefijo `/api`, con `JwtAuthGuard` + `RolesGuard`. Emite eventos WebSocket por namespace `/kanban`.
- **WebSocket Gateway**: autentica por JWT en el handshake, agrupa por rol/sala.

## Dependencias importantes

- `bcryptjs`: hash de contraseñas (no se usa `bcrypt` nativo).
- `class-validator`: DTOs validados globalmente (`ValidationPipe` con `whitelist` + `forbidNonWhitelisted`).
- `socket.io`: tiempo real del Kanban.
- `jose` (frontend): verificación de JWT en middleware edge.

## Flujo general de la aplicación

1. Cliente hace POST `/api/auth/login` → frontend proxy llama a backend → backend devuelve `access_token` → frontend setea cookie `token` (httpOnly, 7 días).
2. `middleware.ts` protege rutas por rol (admin/tecnico/cliente) y redirige a su home.
3. Admin registra clientes/técnicos, recibe equipos, crea servicios (estado `Pendiente`, código `MGS-XXXX`).
4. Técnico mueve tarjetas en Kanban (`PATCH /api/servicios/:id/estado`) → evento WS `servicio:updated` a sala `kanban`.
5. Cliente consulta por código y paga cuando estado = `Listo` (`POST /api/pagos`).
6. Admin/técnico mueve a `Entregado`.

## Convenciones de código

- TypeScript estricto en ambos lados.
- NestJS: módulos con `Controller` + `Service` + `Module` + `DTO` + `Schema`.
- DTOs con `class-validator`; el `ValidationPipe` global es estricto.
- Roles vía decorador `@Roles(...)` + `RolesGuard`.
- Usuario actual inyectado con `@CurrentUser()`.
- Aliasing: `/platos` = equipos, `/pedidos` = servicios (legacy).

## Patrones arquitectónicos

- **BFF (Backend for Frontend)**: el frontend Next.js expone `/api/*` como proxy que setea la cookie httpOnly y reenvía al backend. El cliente nunca ve el JWT directamente.
- **JWT en cookie httpOnly**: el token viaja en cookie, no en localStorage (protege contra XSS de robo de token).
- **Role-based access control (RBAC)**: guard combinado `JwtAuthGuard` + `RolesGuard`.
- **CQRS-lite**: servicios separados por dominio (servicios, pagos, equipos, users).

## Variables de entorno (sin secretos)

### Backend (`backend/.env`)
- `MONGODB_URI` — URI de conexión Mongo Atlas.
- `JWT_SECRET` — secreto compartido (debe coincidir con frontend). Generar con `openssl rand -base64 32`.
- `JWT_EXPIRES_IN` — p. ej. `7d`.
- `PORT` — 4000.
- `CORS_ORIGIN` — origen del frontend.

### Frontend (`frontend/.env.local` / build args)
- `NEXT_PUBLIC_API_URL` — URL pública del backend (`/api` en prod).
- `NEXT_PUBLIC_WS_URL` — URL WS (vacío en prod para usar mismo host).
- `JWT_SECRET` — DEBE coincidir con backend (usado en `middleware.ts` y `auth.ts`).
- `BACKEND_INTERNAL_URL` — URL interna del backend (`http://backend:4000/api` en Docker).
- `COOKIE_SECURE` — `true` en producción para cookie `secure`.

> ⚠️ **Riesgo**: el mismo `JWT_SECRET` se usa en frontend y backend. El frontend solo necesita verificar (no firmar). Idea: usar clave de verificación pública o un secreto distinto de solo-verificación.

## Problemas conocidos (seguridad)

1. **`JWT_SECRET` por defecto débil/hardcodeado**: fallback `'default-secret'` en `jwt.strategy.ts:21` y `'mg-support-tech-secret-change-in-production'` en frontend (`middleware.ts:6`, `auth.ts:6`). Si falta la env, el sistema funciona con secreto conocido →任何人 puede falsificar tokens.
2. **Rate limiting ausente**: login y endpoints públicos no tienen protección contra fuerza bruta.
3. **Sin helmet / security headers** en NestJS (no se usa `@nestjs/helmet` ni config manual).
4. **Cookie sin `secure` por defecto**: `secure: process.env.COOKIE_SECURE === 'true'` → en prod si no se setea, la cookie va por HTTP.
5. **WebSocket autentica pero no autoriza por rol** más allá de unir salas; `emitServicioUpdated` emite a toda la sala `kanban` (incluye clientes) — posible fuga de datos de otros clientes.
6. **CORS `credentials: true` con origen configurable** — asegurar que `CORS_ORIGIN` nunca sea `*`.
7. **Usuario demo `admin/admin123`** documentado en README — debe cambiarse en producción.
8. **`setup.sh` escucha en puerto 80 sin redirigir a 443** si no hay dominio; HTTP plano.
9. **CI/CD (`deploy.yml`) usa `host_check: false`** en SSH — susceptible a MITM en el primer deploy.
10. **No hay `RateLimit` ni `ThrottlerModule`** en NestJS.
11. **`forbidNonWhitelisted: true`** está bien, pero los DTOs de update de usuario permiten `activo` y no validan cambio de rol por no-admin (verificar en `users.controller`).
12. **Logs de backend** escriben a archivos `*.log` en raíz (no rotados) y `.gitignore` los ignora, pero pueden contener datos.

## Decisiones importantes de arquitectura

- **Cookie httpOnly sobre localStorage**: defensa contra XSS token theft.
- **Proxy BFF en Next.js**: centraliza auth y evita CORS entre browser y backend.
- **MongoDB Atlas (cloud)**: sin DB local en prod (Mongo local solo por `profile local-db`).
- **Oracle Cloud Always Free (ARM)**: deploy en VM Ampere A1.
- **WebSocket namespace `/kanban`**: tiempo real aislado del resto de la API.

## Estado de despliegue

- Local: `docker compose up -d` (backend :4000, frontend :3000, mongo opcional).
- Prod: `docker-compose.prod.yml` (puertos cerrados, solo Nginx :80/:443), setup vía `deploy/setup.sh`.
- CI: push a `main` → GitHub Actions despliega vía SSH.
