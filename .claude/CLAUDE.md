# Proyecto: MG Support Tech
## Stack
- Backend: NestJS 10 + TypeScript + MongoDB Atlas (Mongoose)
- Frontend: Next.js 15 (App Router) + Tailwind CSS
- Tiempo real: Socket.io (namespace /kanban)
- Autenticación: JWT (passport-jwt)

## Estructura
- backend/src/modules/* (auth, users, equipos, servicios, pagos, events)
- frontend/src/app/* (admin, tecnico, cliente, api)

## Reglas
- Nunca comitear .env
- Usar DTOs con class-validator en NestJS
- Convención de nombres: camelCase variables, PascalCase clases