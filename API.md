# API.md

> Documentación de API (Backend NestJS bajo prefijo `/api`). Última actualización: 2026-07-19

> Nota: el browser no llama a estos endpoints directamente. Pasa por el proxy `/api/*` de Next.js que setea la cookie. El backend acepta JWT vía `Authorization: Bearer` o cookie `token`.

## Autenticación

- Estrategia: JWT (HS256), en cookie `token` (httpOnly) o header `Authorization: Bearer`.
- Guards: `JwtAuthGuard` + `RolesGuard` en todos los controladores excepto `POST /auth/login`.
- Roles: `admin`, `tecnico`, `cliente`.

## Middleware

- `ValidationPipe` global: `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`.
- CORS: `origin = CORS_ORIGIN`, `credentials: true`.
- Faltante: helmet, throttler/rate-limit.

## Endpoints

### Auth

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| POST | `/api/auth/login` | No | Público | Login. Body: `{email, password}`. Devuelve `{access_token, user}`. |
| GET | `/api/auth/me` | Sí | Todos | Devuelve el usuario actual. |

### Users

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET/POST | `/api/users` | Sí | admin | Listar / crear usuario. |
| GET/PATCH/DELETE | `/api/users/:id` | Sí | admin | Obtener / actualizar / eliminar. |

### Equipos (alias /platos)

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET/POST | `/api/equipos` y `/api/platos` | Sí | admin, tecnico | Listar / crear equipo. |
| GET | `/api/equipos/:id` | Sí | admin, tecnico | Detalle. |

### Servicios (alias /pedidos)

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| POST | `/api/servicios` | Sí | admin | Crear servicio. |
| GET | `/api/servicios` | Sí | todos | Listar (filtrado por rol: técnico→sus servicios, cliente→sus servicios). |
| GET | `/api/servicios/kanban` | Sí | todos | Tablero Kanban (filtrado por rol). |
| GET | `/api/servicios/codigo/:codigo` | Sí | todos | Buscar por código `MGS-XXXX`. ⚠️ Abierto a cualquier rol. |
| GET | `/api/servicios/:id` | Sí | todos | Detalle. |
| PATCH | `/api/servicios/:id/estado` | Sí | admin, tecnico | Cambiar estado (Kanban). Desde `entregado` a un estado anterior (`listo`/`en_reparacion`/`pendiente`) SOLO admin. |
| POST | `/api/servicios/:id/observaciones` | Sí | todos | Agregar observación por fase. |
| GET/POST | `/api/pedidos` | Sí | todos | Alias de servicios (lista). |
| GET | `/api/pedidos/:id` | Sí | todos | Alias detalle. |

### Pagos

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| POST | `/api/pagos` | Sí | cliente, admin | Registrar pago. |
| GET | `/api/pagos/servicio/:servicioId` | Sí | cliente, admin | Pagos de un servicio. |

### Health

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/health` | No | Público | Healthcheck para Docker. |

## Parámetros y validación (DTOs)

- `LoginDto`: `email` (IsEmail), `password` (IsString, IsNotEmpty).
- `CreateUserDto`: `nombre`, `email`, `password` (MinLength 6), `role` (IsEnum), `documentoIdentidad`, opcional `telefono`, `direccion`.
- `CreateServicioDto`: `equipoId`, `clienteId`, `tecnicoId` (IsMongoId), `descripcion`, `costoEstimado` (>=0).
- `UpdateEstadoDto`: `estado` (IsEnum ServiceStatus).
- `AddObservacionDto`: `texto`, `fase` (IsEnum ServiceStatus).

## Respuestas

- Éxito: payload del recurso (HTTP 200/201).
- Error de validación: 400 con detalle de `class-validator`.
- No autenticado: 401 `UnauthorizedException`.
- No autorizado (rol): 403 (por `RolesGuard`).

## Errores conocidos

- Login: mismo mensaje genérico "Credenciales inválidas" (bueno para no enumerar usuarios), pero **sin rate limit** → fuerza bruta posible.
- `findByCodigo` accesible por cualquier rol autenticado → posible enumeración de servicios de terceros.

## WebSockets

- Namespace: `/kanban`.
- Auth: JWT en `handshake.auth.token` o `Authorization` header.
- Eventos entrantes: conexión (handshake).
- Eventos salientes: `servicio:updated` (payload: servicio).
- Salas: `role:<rol>`, `tecnico:<sub>`, `cliente:<sub>`, `kanban`.
