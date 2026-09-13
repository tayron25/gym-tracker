# Evidencia SPR-04 — CP-02B

Estado: aprobado por el propietario; CP-02B cerrada

Fecha: 12 de septiembre de 2026

Alcance: frontend mock de ejercicios y rutinas

## Decisiones autorizadas

- `docs/gym-tracker-engineering-spec-v1.0.md` continúa como fuente normativa.
- Las pantallas faltantes se derivan de Midnight Training Console sin crear otro prototipo.
- `gym-tracker.mock-training-data` persiste ejercicios y rutinas solo en `sessionStorage` y se elimina al cerrar sesión.
- Duplicar usa `(copia)`, `(copia 2)`, etc. para respetar unicidad de rutinas activas.
- ESLint inspecciona TypeScript y TSX mediante `typescript-eslint`.
- SPR-04 muestra si una rutina está lista, pero no crea workouts.

## Trazabilidad automatizada

| Historia / criterio | Evidencia automatizada |
|---|---|
| HU-010, CA-020–022 | búsqueda normalizada, filtros limpiables y archivados ocultos por defecto en `ExercisesPage.test.tsx` y `mock-training-repositories.test.ts` |
| HU-011, CA-023–025 | validación Zod, conflicto de nombre y alta inmediatamente consultable en ejercicios/rutinas |
| HU-012, CA-026–028 | sistema de solo lectura; archivo/restauración sin borrar referencias de rutina |
| HU-020, CA-030–032 | nombre 1–80, borrador vacío permitido, invalidación de lista sin recarga completa |
| HU-021, CA-033–036 | selector sin duplicados, objetivos RN-023 y orden único/consecutivo |
| HU-022, CA-037–038 | copia con IDs nuevos, mismo orden/objetivos y archivo independiente |
| RF-062 | rutas profundas de rutina nueva, detalle de rutina y ficha de ejercicio |
| CP-02B recarga | una segunda instancia del repositorio recupera las mutaciones desde la sesión |

## Comandos reproducibles

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

Resultado final reproducible: TypeScript sin errores, ESLint sin errores, 8 archivos de prueba y 24 pruebas aprobadas, y build de producción generado correctamente (1685 módulos transformados). No se versionan logs generados.

`npm audit --omit=dev` informa cero vulnerabilidades de producción. El audit completo informa dos vulnerabilidades moderadas en dependencias de desarrollo de Vitest; la corrección automática propuesta exige una actualización mayor a Vitest 5. Quedan registradas para una actualización de tooling separada.

## Evidencia responsive automatizada

| Ancho | Ruta inspeccionada | Captura | `clientWidth / scrollWidth` | Resultado |
|---:|---|---|---:|---|
| 360 px | `/app/routines/routine-push-a` | `spr-04/360-routine-editor.png` | 360 / 360 | sin desbordamiento |
| 390 px | `/app/exercises` | `spr-04/390-exercise-catalog.png` | 390 / 390 | sin desbordamiento |
| 768 px | `/app/routines` | `spr-04/768-routines.png` | 768 / 768 | sin desbordamiento |
| 1280 px | `/app/exercises/exercise-lateral-custom` | `spr-04/1280-exercise-detail.png` | 1280 / 1280 | sin desbordamiento |

El reporte reproducible completo está en `spr-04-browser-checks.json`. El script `scripts/capture-spr-04.mjs` levanta Chrome headless, mide el documento y regenera las capturas.

## Evidencia de teclado automatizada

- El diálogo de ejercicio abre y lleva foco a `exercise-name`.
- Escape cierra el diálogo y devuelve foco a `Nuevo ejercicio`.
- `Bajar Press banca` recibe foco y Enter cambia el orden a Press militar, Press banca y Elevación lateral en cable.

## Guion de aceptación del propietario

1. Buscar y limpiar filtros sin ratón.
2. Abrir el diálogo de ejercicio, completar campos, cerrarlo con Escape y comprobar retorno de foco.
3. Crear una rutina, abrir el selector, añadir dos ejercicios e impedir el duplicado.
4. Reordenar con Subir/Bajar, editar objetivos y guardar.
5. Duplicar, archivar, mostrar archivadas y restaurar.
6. Recargar la página y comprobar que las mutaciones continúan en la sesión.
7. Cerrar sesión y comprobar que los datos privados simulados ya no están disponibles.

Tayron aceptó el incremento el 12 de septiembre de 2026 y autorizó cerrar CP-02B. Esta aceptación no autoriza iniciar SPR-05.
