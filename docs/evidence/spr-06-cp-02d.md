# Evidencia SPR-06 — CP-02D

Estado: implementación completa del frontend mock; CP-02D aprobada por Tayron el 2026-09-13.

Fecha: 13 de septiembre de 2026

Alcance: historial, detalle histórico, notas, eliminación mock, última sesión, PR, e1RM, gráfica diferida, series semanales, errores, reintentos y accesibilidad. No se modificaron Supabase, migraciones, Auth real ni sprints posteriores.

## Trazabilidad implementada

| Historia | Evidencia |
|---|---|
| HU-040 / CA-060–062 | `/app/history` lista workouts completados en orden descendente, pagina cinco elementos y presenta estado vacío. |
| HU-041 / CA-063–065 | Última sesión y series working se muestran en la ficha del ejercicio; sin datos aparece “Primera vez”. |
| HU-042 / CA-066–068 | PR de peso, repeticiones por carga y e1RM se calculan desde series working elegibles; la eliminación invalida historial y analítica. |
| HU-043 / CA-069–071 | `/app/progress` muestra tendencia de e1RM, selector de rango y tabla con los mismos puntos. |
| HU-044 / CA-072–074 | Series semanales por músculo primario, navegación de semana y zona horaria del perfil. |
| HU-045 / CA-075–076 | Notas editables; eliminación con confirmación, advertencia y recálculo mock. |
| HU-050 / CA-080–082 | Operaciones mock de historial/analítica soportan fallos recuperables y reintento sin falso guardado. |
| HU-051 / CA-083–085 | Rutas, controles, diálogo de eliminación, foco y mensajes tienen nombres y estados accesibles. |

## Evidencia automatizada

```text
npm.cmd run typecheck       → aprobado
npm.cmd run lint            → aprobado, 0 errores y 0 warnings
npm.cmd run test:run        → aprobado, 15 archivos y 49 pruebas
npm.cmd run build           → aprobado, 2283 módulos transformados
npm.cmd audit --omit=dev    → 0 vulnerabilidades de producción
```

Pruebas nuevas principales:

- `src/infrastructure/repositories/mock/mock-history-repositories.test.ts`: paginación, snapshots, notas, eliminación, PR, tendencia, semana y fallo remoto.
- `src/domain/metrics/workout-metrics.test.ts`: exclusión de warmup/approach/peso cero en volumen y PR.
- `src/features/history/HistoryPage.test.tsx`: lista, paginación, nota, diálogo y eliminación.
- `src/features/progress/ProgressPage.test.tsx`: PR, gráfica, tabla, rango y semana.
- `src/app/router/product-routes.test.tsx`: restauración directa de historial, detalle y progreso.

## Bundle y carga diferida

La gráfica usa `React.lazy` y un chunk separado `ProgressChart-*.js`; `ProgressPage` no importa Recharts de forma estática. El build muestra una advertencia de tamaño para el chunk principal de la aplicación, pero termina correctamente.

## Captura responsive

El script reproducible está en `scripts/capture-spr-06.mjs` y generó capturas reales para historial, detalle y progreso en 360, 390, 768 y 1280 px.

- La reproducción sin modificar el capturador completó las 12 capturas con Chrome 152, lo que confirmó que el timeout anterior era intermitente y ocurría antes de navegar.
- La infraestructura se endureció con `--headless=new`, timeout CDP de 15 segundos, selección `--browser=chrome|edge` y registro de `/json/version` y del target WebSocket.
- La ejecución final con Edge 153 completó 12 de 12 capturas, sin desbordamiento horizontal; la gráfica, paginación, nota histórica y series semanales aparecen en las rutas previstas.
- `docs/evidence/spr-06-browser-checks.json` registra navegador, protocolo, target, tamaño y SHA-256 de cada PNG para verificar que los archivos son reales y reproducibles.

## Pendiente de puerta

La implementación, las pruebas automatizadas y la captura responsive están completas. El propietario revisó y aprobó explícitamente CP-02D el 2026-09-13.
