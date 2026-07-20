---
name: tester
description: Run and maintain automated tests for MG Support Tech. Use when asked to "run tests", "add tests", "validate changes", "check the build", or after modifying backend (NestJS) or frontend (Next.js) code. Ensures the project compiles and tests pass before considering a change done.
---

# Tester Skill — MG Support Tech

Valida que el proyecto compile y que las pruebas pasen en cada cambio.

## Backend (NestJS)

Tests con Jest + `@nestjs/testing`, usando mocks (sin MongoDB real).

```powershell
cd D:\Proyectos\cursor\pruebasupport\backend
npm run build      # compila con nest (debe ser EXIT 0)
npm test           # ejecuta jest (debe ser EXIT 0, 0 failed)
npm run test:cov   # cobertura (opcional)
```

- Convención: un archivo `<nombre>.service.spec.ts` por servicio, en la misma carpeta `src/<modulo>/`.
- Mockear `getModelToken('X')`, `EventsGateway` y `AppLogger` con `jest.fn()`.
- Los métodos de mongoose que se `await` directo (sin `.exec()`) deben devolver un objeto **thenable**; los que usan `.populate().exec()` deben devolver un chain con `populate`/`sort`/`exec` encadenables. Ver `src/servicios/servicios.service.spec.ts` para el helper `queryChain`.

## Frontend (Next.js)

No hay framework de tests configurado todavía. Validar tipos con:

```powershell
cd D:\Proyectos\cursor\pruebasupport\frontend
npx tsc --noEmit    # debe ser EXIT 0
```

## Checklist antes de dar por terminado un cambio

1. Backend: `npm run build` EXIT 0.
2. Backend: `npm test` EXIT 0 (0 failed).
3. Frontend: `npx tsc --noEmit` EXIT 0.
4. Si el cambio afecta un servicio con guard de rol, agregar/ajustar el `*.spec.ts` cubriendo el caso de rol (admin/tecnico/cliente).
5. Commitear y pushear solo si los 3 pasos anteriores pasan.

## Reglas

- Nunca subir `*.tsbuildinfo` (en `.gitignore`).
- Todo nuevo endpoint/servicio debe tener su spec que cubra el `RolesGuard`/rol correspondiente.
- No ejecutar el servidor en producción como validación; usar build + test + tsc.
