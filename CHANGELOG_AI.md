# CHANGELOG_AI.md

> Registro de cambios funcionales detectados automáticamente. No registrar cambios cosméticos.
> Última actualización: 2026-07-19

## 2026-07-20

### Nuevo

- Tests del backend configurados: Jest + ts-jest + `@nestjs/testing`, scripts `test`/`test:watch`/`test:cov` y sección `jest` en `package.json`.
- `servicios.service.spec.ts`: 13 tests cubriendo transiciones de Kanban, permisos por rol (admin/tecnico/cliente), reversión desde `entregado` solo admin, bloqueo de entrega sin pago y casos NotFound.
- Skill `tester` (`.agents/skills/tester/SKILL.md`) con checklist de validación en cada cambio (build backend + jest + tsc frontend).

- Control de errores centralizado en backend: `AppLogger` estructurado (JSON), `GlobalExceptionFilter` y excepciones de dominio (`domain.exception.ts`).
- Logger de consola en frontend (`ui-logger.ts`) integrado en `api.ts` y `api-auth.ts` para validar errores y respuestas erróneas.
- Proxies Next.js faltantes: `servicios/[id]`, `servicios/[id]/estado`, `servicios/[id]/observaciones`, `servicios/codigo/[codigo]`, `pagos/servicio/[servicioId]`, `pedidos/[id]`, `users/[id]` (usando `path='auto'`).

### Modificado

- `ServiciosService.updateEstado`: ahora permite revertir desde `entregado` a `listo`/`en_reparacion`/`pendiente`, restringido SOLO a rol admin. Técnicos/clientes no pueden modificar servicios entregados.
- `KanbanBoard.tsx`: resuelve el estado destino del drag correctamente (evita enviar un ObjectId como estado cuando se suelta sobre una tarjeta) — corrige 400 de ValidationPipe.
- `GlobalExceptionFilter`: expone el array de mensajes de validación en `message`/`details`.

### Eliminado

-

## 2026-07-19

### Nuevo

- (Análisis inicial del repositorio) Proyecto MG Support Tech detectado: Next.js + NestJS + MongoDB + Socket.io, con roles admin/técnico/cliente, Kanban en tiempo real y pagos.

### Modificado

-

### Eliminado

-
