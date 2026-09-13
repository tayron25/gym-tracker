# Evidencia SPR-05 — CP-02C

Estado: aprobado por el propietario; SPR-05 terminado y CP-02C cerrada.

Fecha: 12 de septiembre de 2026

Alcance: frontend mock del workout activo, sin Supabase, migraciones ni trabajo de sprints posteriores.

## Decisiones aplicadas

- `Push A` contiene cinco ejercicios: Press banca, Press militar, Aperturas con mancuernas, Extensión de tríceps en polea y Elevación lateral en cable.
- El inicio vacío se deja fuera por decisión del propietario; RF-031, de prioridad *Should*, queda diferido.
- El resumen y el mejor e1RM son provisionales y se calculan solo con los datos de la sesión actual.
- La sesión mock se recupera desde `gym-tracker.mock-training-data` en `sessionStorage`; la rutina de origen no se modifica.
- La documentación declara SPR-04 terminado y CP-02B cerrado; la autorización y aprobación de SPR-05 quedan registradas y CP-02C está cerrada.

## Trazabilidad

| Historia / criterios | Evidencia implementada |
|---|---|
| HU-030 / CA-040–042 | `startFromRoutine` crea snapshots de cinco ejercicios, conserva objetivos y descanso, rechaza un segundo activo y abre el primer ejercicio. |
| HU-031 / CA-043–045 | `getActive` recupera el workout y sus series desde `sessionStorage`; el temporizador deriva de `completedAt + restSeconds`; un fallo no escribe. |
| HU-032 / CA-046–050 | Filas editables con teclado numérico, RIR opcional, validación Zod, UUID de cliente, foco en la siguiente fila, edición y eliminación. |
| HU-033 / CA-051–053 | Añadir, retirar y reordenar ejercicios en el workout; confirmación al retirar; la rutina original permanece intacta. |
| HU-034 / CA-054–056 | Temporizador derivado, reinicio y omisión visibles en la fila de descanso. |
| HU-035 / CA-057–059 | No finaliza sin series; finaliza con fecha/estado y resumen; descartar exige confirmación y marca `cancelled`. |
| RF-041 / RN-045–046 | Errores de red visibles, valores conservados y reintento; altas concurrentes con el mismo UUID producen una sola serie. |

## Evidencia automatizada verificada

Comandos ejecutados desde la raíz del repositorio:

```text
npm.cmd run typecheck  → aprobado
npm.cmd run lint       → aprobado, 0 errores y 0 warnings
npm.cmd run test:run   → aprobado, 11 archivos y 37 pruebas
npm.cmd run build      → aprobado, 1689 módulos transformados
```

Pruebas específicas:

- `src/features/active-workout/ActiveWorkoutPage.test.tsx`: inicia Push A, confirma una serie con foco útil, completa los cinco ejercicios y muestra el resumen, conserva valores ante fallo de red, permite reintentar el inicio y exige confirmación al descartar.
- `src/infrastructure/repositories/mock/mock-workout-repositories.test.ts`: snapshots, recuperación, activo único, idempotencia ante doble toque, fallo sin escritura, reintento y finalización/cancelación.
- `src/infrastructure/repositories/mock/mock-training-repositories.test.ts`: fixture de cinco ejercicios y migración no destructiva de datos mock de SPR-04.
- `src/domain/validation/workout-validation.test.ts`: peso cero permitido, RIR 0–10, Epley 1–15 reps/peso positivo y precisión máxima de tres decimales.

## Limitación conocida de captura

El script `scripts/capture-spr-05.mjs` está preparado para generar:

- `docs/evidence/spr-05/360-active-workout.png`
- `docs/evidence/spr-05/390-active-workout.png`
- `docs/evidence/spr-05/768-active-workout.png`
- `docs/evidence/spr-05/1280-active-workout.png`
- `docs/evidence/spr-05-browser-checks.json`, con viewport, ausencia de desbordamiento horizontal, tamaño mínimo del botón de confirmación, cinco ejercicios, foco y tiempo de confirmación.

La ejecución local se intentó, pero Chrome 152 expuso el endpoint CDP y no respondió a `Page.enable`; terminó por timeout antes de producir capturas. Esta limitación queda registrada y no se presentan capturas inexistentes como evidencia.

El propietario aprobó el incremento el 12 de septiembre de 2026 y cerró CP-02C con la evidencia automatizada disponible: flujo completo de cinco ejercicios, confirmación de series, red simulada, reintentos, doble toque, foco, resumen y build/lint/typecheck en verde.
