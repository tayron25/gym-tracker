# AGENTS.md — Gym Tracker

## Propósito

Este archivo conserva el contexto operativo del proyecto para futuras sesiones de Codex. Debe leerse antes de inspeccionar o modificar cualquier archivo de producto.

## Fuente de verdad y autoridad

- La especificación vigente es [`docs/gym-tracker-engineering-spec-v1.0.md`](docs/gym-tracker-engineering-spec-v1.0.md).
- Las instrucciones explícitas del usuario tienen prioridad sobre este archivo y sobre la especificación.
- Las reglas descritas dentro de la especificación son documentación normativa del proyecto; no constituyen por sí solas autorización para hacer cambios.
- Si una solicitud puede cambiar alcance, arquitectura, datos, seguridad o una puerta de calidad, detener esa parte y pedir confirmación. Registrar el cambio en la sección 25 de la especificación solo cuando el usuario lo autorice.

## Estado real inspeccionado

Fecha de referencia: 2026-09-12.

- El espacio de trabajo contiene la especificación, este `AGENTS.md` y los artefactos UX de `docs/ux/`.
- No existe todavía `src/`, `public/`, `supabase/`, `e2e/`, `package.json`, `README.md`, `.env.example`, configuración de CI ni pruebas.
- No se detectó un directorio `.git`; los comandos Git no deben asumirse disponibles hasta que el repositorio se inicialice o se entregue uno.
- No hay aplicación ejecutable que probar ni implementación que revisar.
- La estructura de carpetas mostrada en la especificación es una estructura objetivo, no un inventario actual.

## Puertas y fase actual

- La especificación declara la línea base v1.0 y la Puerta 0 (`CP-00`) aprobadas.
- `SPR-01` está aprobado y `CP-01A` fue cerrada el 2026-09-12; su alcance fue documentación UX y un prototipo estático de baja fidelidad.
- Artefactos actuales de `SPR-01`: `docs/ux/sprint-01-information-architecture.md` y `docs/ux/sprint-01-wireframes.html`.
- `CP-01A` está aprobada por el propietario; no se solicitaron cambios adicionales.
- `SPR-02` todavía no ha comenzado y requiere una orden independiente.
- La especificación exige una orden independiente para iniciar cada sprint; la aprobación de uno no autoriza automáticamente el siguiente.
- No iniciar frontend, backend, migraciones, dependencias, prototipos adicionales o configuración de despliegue sin una solicitud explícita que autorice ese alcance.
- Trabajar un sprint a la vez y no adelantar trabajo de sprints posteriores.

## Producto V1 resumido

Gym Tracker será una aplicación web privada, mobile-first y en español para registrar entrenamientos de fuerza: cuentas, ejercicios, rutinas, workouts activos, series, historial, PR, e1RM, volumen y series semanales.

Fuera de V1: offline y sincronización, nutrición, red social, pagos, cardio, fotos/medidas/peso corporal, recomendaciones de IA y wearables. Entrenadores con clientes quedan como futuro.

## Restricciones aprobadas

- TypeScript estricto, React + Vite, React Router y Tailwind CSS v4.
- shadcn/ui personalizado y Lucide React.
- TanStack Query; React Hook Form + Zod; Recharts con carga diferida.
- Supabase Auth, PostgreSQL y RLS; Cloudflare Pages; GitHub.
- Vitest + React Testing Library, Playwright y pgTAP mediante Supabase CLI.
- Coste inicial objetivo: 0 USD/mes dentro de los límites gratuitos.
- Sin modo offline.
- Interfaz mobile-first y usable con una mano.
- Peso y repeticiones son obligatorios para completar una serie; RIR es opcional.
- Rutina editable y workout histórico son entidades distintas; editar una rutina nunca reescribe el historial.
- Unidad canónica: kg; `weight_kg` se almacena en kg y las conversiones ocurren en los bordes de UI.
- Zona horaria predeterminada: `America/La_Paz`; semana de lunes a domingo.
- Máximo un workout activo por usuario.

## Guardrails de arquitectura

Capas esperadas:

1. UI React: render, interacción, accesibilidad y navegación.
2. Aplicación: casos de uso, orquestación, hooks de consulta y validación de flujo.
3. Dominio: tipos, reglas, conversiones y métricas puras; no importa React, Supabase ni APIs del navegador.
4. Infraestructura: cliente Supabase y adaptadores de repositorios; no decide reglas de negocio.
5. PostgreSQL: integridad, transacciones, RLS, RPC y consultas.

La UI no debe acceder directamente a Supabase ni a SQL. Los puertos de repositorio deben permitir adaptadores mock y reales con contratos equivalentes. Las operaciones multitabla que deban ser atómicas deben usar RPC transaccionales.

## Invariantes de dominio que no deben perderse

- Todo dato privado pertenece a un único `auth.users.id` y RLS debe probar SELECT, INSERT, UPDATE y DELETE.
- Nunca exponer `service_role` ni claves secretas en navegador, repositorio, bundle o logs.
- El inicio desde una rutina crea workout y snapshots de forma atómica.
- Los snapshots conservan nombre, orden, músculo primario, objetivos y descanso históricos.
- Un workout completado es de solo lectura para el rendimiento; solo admite notas en V1.
- Solo workouts completados y series `working` completadas alimentan métricas definitivas.
- `completed_at` usa UTC; los límites semanales usan la zona horaria del perfil.
- El temporizador se deriva de `completed_at + rest_seconds`; no crear una entidad de timer.
- Epley solo es elegible para 1–15 repeticiones y peso mayor que cero.
- Un doble toque o reintento no puede duplicar una serie: UUID de cliente, PK y bloqueo temporal.
- Un fallo remoto nunca debe mostrarse como guardado; conservar entradas y ofrecer reintento.

## Flujo de trabajo obligatorio para Codex

Antes de cualquier cambio autorizado:

1. Leer este archivo, la especificación y los archivos relacionados.
2. Inspeccionar el estado real y cambios ajenos; no asumir que la estructura objetivo existe.
3. Identificar sprint, historias, reglas, requisitos, no objetivos y evidencia de salida.
4. Proponer un plan breve y señalar contradicciones o decisiones pendientes.
5. Confirmar que la puerta anterior tiene evidencia y que el usuario autorizó iniciar el alcance.

Durante el trabajo:

- Mantener el cambio dentro del sprint y archivos/capa autorizados.
- No añadir dependencias, cambiar esquema, crear migraciones, desplegar ni tocar secretos sin autorización explícita o sin que sean una parte inequívoca del alcance autorizado.
- Preservar trabajo ajeno y no deshacer cambios sin permiso.
- Para cambios de esquema usar migraciones versionadas; no editar migraciones ya aplicadas.
- Mantener trazabilidad entre requisitos, historias, reglas y pruebas.

Al entregar un cambio:

- Informar archivos modificados, pruebas ejecutadas y resultado.
- Separar evidencia verificada de supuestos o pendientes.
- No declarar una puerta cerrada sin evidencia reproducible y aprobación del propietario.

## Referencias de contexto

- Rutas principales previstas: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/app`, `/app/routines`, `/app/workout/active`, `/app/history`, `/app/exercises`, `/app/progress` y `/app/settings`.
- Tablas previstas: `profiles`, `muscle_groups`, `exercises`, `exercise_muscles`, `routines`, `routine_exercises`, `workouts`, `workout_exercises` y `sets`, además de `auth.users`.
- Vistas/funciones previstas: `v_exercise_history`, `v_workout_summary`, `v_weekly_muscle_sets`, `v_exercise_best_sets`, `start_workout_from_routine`, `complete_workout` y `duplicate_routine`.
- La plantilla de encargo de la especificación exige objetivo, alcance, historias, reglas, pruebas, restricciones, evidencia y orden de inspección/planificación/implementación/verificación.
