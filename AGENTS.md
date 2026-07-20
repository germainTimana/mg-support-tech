# AGENTS.md

> Instrucciones para modelos/agentes que trabajen en este repo. Última actualización: 2026-07-19

## Tecnologías utilizadas

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 3, @dnd-kit, socket.io-client, `jose` para JWT en edge.
- **Backend**: NestJS 10, Mongoose 8, MongoDB Atlas, @nestjs/jwt, passport-jwt, bcryptjs, class-validator.
- **Infra**: Docker Compose, Nginx, GitHub Actions, Oracle Cloud (Ubuntu ARM64).

## Convenciones

- TypeScript en ambos lados; sin `any` innecesario.
- NestJS: un módulo por dominio (`Controller` + `Service` + `Module` + `DTO` + `Schema`).
- Validación siempre con DTOs `class-validator` (el `ValidationPipe` global es estricto: `whitelist` + `forbidNonWhitelisted`).
- Roles vía `@Roles(...)` + `RolesGuard`; usuario actual con `@CurrentUser()`.
- El frontend NUNCA expone el JWT al cliente; viaja en cookie `token` (httpOnly) gestionada por `app/api/*/route.ts`.

## Estilo de código

- Funciones pequeñas y nombradas por intención.
- Mensajes de error de auth genéricos (no revelar si el email existe).
- No agregar comentarios innecesarios.

## Patrones permitidos

- Proxy BFF: nuevos endpoints del backend se consumen vía `app/api/*/route.ts` en el frontend.
- Aliasing de rutas legacy (`/platos`, `/pedidos`) — mantener por compatibilidad.
- Emisión de eventos WS solo desde `EventsGateway.emitServicioUpdated`.

## Patrones prohibidos

- ❌ Exponer el JWT en `localStorage` o devolverlo al browser fuera de la cookie.
- ❌ Hardcodear secretos o `JWT_SECRET` por defecto (`default-secret`, `mg-support-tech-secret-change-in-production`).
- ❌ Usar `credentials: true` con `CORS_ORIGIN=*`.
- ❌ Eludir `RolesGuard`/`JwtAuthGuard` en controladores nuevos.
- ❌ Devolver el password del usuario en respuestas (usar `sanitize`).
- ❌ Comentarios en el código salvo que se soliciten.

## Cómo agregar nuevas funcionalidades

1. Backend: crear módulo NestJS con DTOs validados, protegido por `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles(...)`.
2. Si afecta el Kanban: emitir `servicio:updated` desde el service vía `EventsGateway`.
3. Frontend: añadir página en `app/<rol>/` si es UI, o ruta proxy en `app/api/.../route.ts` si es API.
4. Documentar el nuevo endpoint en `API.md` y el módulo en `MODULES.md`.
5. Registrar el cambio funcional en `CHANGELOG_AI.md`.

## Cómo realizar refactors

- Mantener compatibilidad de API (aliases `/platos`, `/pedidos` se conservan).
- No cambiar la firma del JWT sin coordinar frontend y backend (comparten `JWT_SECRET`).
- Actualizar `PROJECT_CONTEXT.md` / `ARCHITECTURE.md` si cambia la arquitectura.

## Reglas para escribir pruebas

- (Pendiente de implementar) Backend: Jest + Supertest para controllers y services.
- (Pendiente de implementar) Frontend: no hay framework de tests configurado.
- Toda prueba nueva debe cubrir el guard de rol correspondiente.

## Reglas para mantener compatibilidad

- El browser solo habla con `/api/*` de Next.js; no agregar llamadas directas a `:4000`.
- `JWT_SECRET` debe ser idéntico en backend y frontend (o usar clave de solo-verificación en frontend).
- Variables de entorno: documentar nuevas en `.env.production.example` y `PROJECT_CONTEXT.md`.

## Qué archivos consultar antes de modificar código

1. `PROJECT_CONTEXT.md` — contexto general y riesgos.
2. `AGENTS.md` — patrones permitidos/prohibidos.
3. `MODULES.md` — responsabilidad y dependencias del módulo a tocar.
4. `API.md` — contratos de endpoints y DTOs.
5. `ARCHITECTURE.md` — flujos y dependencias entre capas.
6. `CHANGELOG_AI.md` — cambios funcionales recientes.
7. Código: `backend/src/main.ts` (pipes/CORS), `frontend/src/middleware.ts` (rutas por rol), `backend/src/events/events.gateway.ts` (WS auth).
