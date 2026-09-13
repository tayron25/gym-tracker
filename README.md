# Gym Tracker

Frontend mobile-first de Gym Tracker. En SPR-06 la autenticación, los ejercicios, las rutinas, el workout activo, el historial y el progreso usan repositorios simulados; no requiere Supabase ni variables de entorno.

## Requisitos

- Node.js 24.x
- npm 11.x

Puedes comprobar las versiones instaladas con:

```bash
node --version
npm --version
```

## Instalar dependencias

Desde la raíz del repositorio:

```bash
npm ci
```

## Levantar la página en desarrollo

```bash
npm run dev
```

Después abre [http://localhost:5173](http://localhost:5173).

En Windows, si PowerShell bloquea el comando `npm`, usa `npm.cmd`:

```powershell
npm.cmd run dev
```

## Probar desde un celular en la misma red Wi‑Fi

`localhost` en el celular apunta al propio celular. Expón Vite en la red local:

```bash
npm run dev -- --host 0.0.0.0
```

En Git Bash, consulta la IPv4 de tu PC:

```bash
ipconfig | grep -i "IPv4"
```

Abre en el celular la IPv4 del adaptador Wi‑Fi con el puerto `5173`, por ejemplo:

```text
http://192.168.1.25:5173/
```

Ambos dispositivos deben estar en la misma red y Windows debe permitir Node.js en redes privadas.

## Acceso de demostración

La cuenta ficticia disponible es:

- Correo: `tayron@example.com`
- Contraseña: `password`

La aplicación usa `sessionStorage` para la marca ficticia `gym-tracker.mock-session` y el estado temporal `gym-tracker.mock-training-data`. Los ejercicios y rutinas creados sobreviven una recarga dentro de la misma sesión; al cerrar sesión se eliminan ambas claves. No se usa `localStorage` ni IndexedDB.

## Comandos de verificación

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

El build de producción se genera en `dist/`.

## Rutas principales

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/app`
- `/app/routines`
- `/app/routines/new`
- `/app/routines/:id`
- `/app/exercises`
- `/app/exercises/:id`
- `/app/settings`
- `/app/history`
- `/app/history/:id`
- `/app/progress`

Historial y progreso muestran sesiones completadas, snapshots, notas, eliminación confirmada, PR, e1RM, gráfica diferida y series semanales dentro de la sesión simulada. El workout activo permite iniciar una rutina, registrar series, reintentar errores y finalizar o descartar la sesión.
