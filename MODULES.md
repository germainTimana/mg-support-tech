# MODULES.md

> Catálogo de módulos. Última actualización: 2026-07-19

## auth

- **Responsabilidad**: Autenticación (login) y validación de JWT.
- **Archivos principales**: `auth.controller.ts`, `auth.service.ts`, `strategies/jwt.strategy.ts`, `guards/jwt-auth.guard.ts`, `dto/login.dto.ts`.
- **Dependencias**: `users`.
- **Servicios que consume**: `UsersService` (findByEmail, findById, sanitize).
- **Eventos que produce**: ninguno (HTTP).
- **Eventos que escucha**: ninguno.
- **Riesgos**: fallback `JWT_SECRET='default-secret'` si falta env (`jwt.strategy.ts:21`). Login sin rate limit.
- **Estado**: Activo.

## users

- **Responsabilidad**: CRUD de usuarios (admin, técnico, cliente), hash de password, sanitización.
- **Archivos principales**: `users.controller.ts`, `users.service.ts`, `dto/user.dto.ts`, `schemas/user.schema.ts`.
- **Dependencias**: `auth` (para guard).
- **Servicios que consume**: Mongoose.
- **Eventos que produce/escucha**: ninguno.
- **Riesgos**: verificar que un usuario no-admin no pueda cambiar `role` vía `UpdateUserDto`. El DTO no incluye `role` en update (bien), pero sí `activo`.
- **Estado**: Activo.

## equipos

- **Responsabilidad**: Registro de equipos recibidos (marca, modelo, problema). Alias `/platos`.
- **Archivos principales**: `equipos.controller.ts`, `equipos.service.ts`, `platos.controller.ts`, `dto/equipo.dto.ts`, `schemas/equipo.schema.ts`.
- **Dependencias**: `users` (para RBAC), `auth`.
- **Eventos**: ninguno.
- **Riesgos**: bajo.
- **Estado**: Activo.

## servicios

- **Responsabilidad**: Ciclo de vida del servicio, código único `MGS-XXXX`, Kanban, observaciones por fase. Alias `/pedidos`.
- **Archivos principales**: `servicios.controller.ts`, `servicios.service.ts`, `dto/servicio.dto.ts`, `schemas/servicio.schema.ts`.
- **Dependencias**: `equipos`, `users`, `pagos`, `events`.
- **Servicios que consume**: `EventsGateway.emitServicioUpdated`.
- **Eventos que produce**: emite `servicio:updated` vía gateway.
- **Riesgos**: `findAll` filtra por rol, pero `findByCodigo` es abierto a cualquier rol autenticado (fuga de código → datos de terceros). El broadcast WS va a toda la sala `kanban`.
- **Estado**: Activo.

## pagos

- **Responsabilidad**: Registro de pagos (Nequi / B-Bre) cuando el servicio está `Listo`.
- **Archivos principales**: `pagos.controller.ts`, `pagos.service.ts`, `dto/pago.dto.ts`, `schemas/pago.schema.ts`.
- **Dependencias**: `servicios`.
- **Eventos**: ninguno directo.
- **Riesgos**: validar que el monto y el estado previo sean correctos; evitar doble pago.
- **Estado**: Activo.

## events

- **Responsabilidad**: Gateway WebSocket (namespace `/kanban`) que autentica por JWT y emite actualizaciones.
- **Archivos principales**: `events.gateway.ts`, `events.module.ts`.
- **Dependencias**: `auth` (JwtService).
- **Eventos que produce**: `servicio:updated` a sala `kanban`.
- **Eventos que escucha**: conexión de clientes (handshake auth).
- **Riesgos**: autorización por sala demasiado amplia; emite a clientes datos de otros. Sin rate limit de conexiones.
- **Estado**: Activo.

## common

- **Responsabilidad**: infraestructura transversal: RBAC, decoradores, enums.
- **Archivos principales**: `enums.ts`, `decorators/roles.decorator.ts`, `decorators/current-user.decorator.ts`, `guards/roles.guard.ts`.
- **Dependencias**: ninguna.
- **Estado**: Activo.

## health

- **Responsabilidad**: endpoint `/api/health` para docker healthcheck.
- **Archivos principales**: `health.controller.ts`.
- **Estado**: Activo.
