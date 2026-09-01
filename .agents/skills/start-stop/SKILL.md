---
name: start-stop
description: Start or stop the MG Support Tech backend and frontend services. Use when asked to "ejecutar el proyecto", "iniciar", "arrancar", "detener el proyecto", "parar", "shutdown".
---

# Start/Stop Skill — MG Support Tech

Inicia o detiene los servicios backend (NestJS) y frontend (Next.js) del proyecto.

## Iniciar el proyecto

Cuando el usuario indique "ejecutar el proyecto", "iniciar", "arrancar":

1. **Backend** (NestJS en puerto 4000):
```bash
cd D:\Proyectos\cursor\pruebasupport\backend
npm run start:dev
```

2. **Frontend** (Next.js en puerto 3000):
```bash
cd D:\Proyectos\cursor\pruebasupport\frontend
npm run dev
```

3. Informar al usuario que el backend corre en `http://localhost:4000` y el frontend en `http://localhost:3000`.

## Detener el proyecto

Cuando el usuario indique "detener el proyecto", "parar", "shutdown":

1. **Detener el frontend**:
```bash
cd D:\Proyectos\cursor\pruebasupport\frontend
# Ctrl+C o matar el proceso de npm run dev
```

2. **Detener el backend**:
```bash
cd D:\Proyectos\cursor\pruebasupport\backend
# Ctrl+C o matar el proceso de npm run start:dev
```

Si los procesos están corriendo en segundo plano, encontrar y detener los procesos de `node` o `next`:
```bash
# Detener todos los procesos de next/node relacionados
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process
```

3. Informar al usuario que ambos servicios se detuvieron.

## Verificación

Para verificar que ambos servicios están corriendos:
```bash
# Verificar backend
curl -s http://localhost:4000/api/health

# Verificar frontend
curl -s http://localhost:3000 | Select-Object -First 1
```

## Reglas

- Siempre iniciar el backend antes que el frontend (el frontend depende del backend).
- Siempre detener el frontend antes que el backend.
- El puerto 4000 se reserva para el backend y el 3000 para el frontend. No usar esos puertos para otros servicios.
- Si algún puerto ya está en uso, indicar al usuario qué proceso lo usa y preguntar si desea detenerlo o usar otro puerto.
