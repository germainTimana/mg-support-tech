---
name: tester
description: Run and maintain automated tests for MG Support Tech. Use when asked to "run tests", "add tests", "validate changes", "check the build", or after modifying backend (NestJS) or frontend (Next.js) code. Ensures the project compiles and tests pass before considering a change done.
---

# Tester Skill — MG Support Tech

Valida que el proyecto compile, que las pruebas pasen y ejecuta el flujo de git para subir cambios.

## Flujo de git (subir cambios a git)

Cuando se indique "sube los cambios a git", ejecutar en este orden:

1. **Commit** en la rama actual (detectada automáticamente, ej: `dev_support_mg`)
2. **Push** a la rama remota correspondiente (`origin/<rama_actual>`)
3. **Switch** a `main`
4. **Pull** desde `origin/main`
5. **Merge** la rama de trabajo (la que estaba antes del paso 3) en `main`
6. **Push** a `origin/main`
7. **Volver a la rama de trabajo** (`dev_support_mg` o la que corresponda) para continuar

### Variables a detectar en cada ejecución

- `CURRENT_BRANCH` = rama donde se hizo el commit (paso 1). Guardar antes de cambiar a `main`.

### Comandos PowerShell secuenciales

```powershell
# 1. Commit (el mensaje va según el cambio)
git commit -m "feat: <descripción>"

# 2. Push a la rama actual
git push origin <CURRENT_BRANCH>

# 3. Cambiar a main
git checkout main

# 4. Traer cambios remotos
git pull origin main

# 5. Merge de la rama de trabajo
git merge <CURRENT_BRANCH>

# 6. Push a main
git push origin main

# 7. Volver a la rama de trabajo
git checkout <CURRENT_BRANCH>
```

### Reglas para commit

- Mensaje en español, siguiendo conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Incluir un cuerpo con bullet points detallando cada archivo tocado (opcional si son muchos).
- No hacer `git add -A` sin verificar antes `git status` y `git diff --stat HEAD`.
- No commitear `.env`, `.env.local`, `node_modules`, `dist`, `.next`.
- Si hay cambios que no deben ir al commit (archivos personales), usar `git add` selectivo.

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
