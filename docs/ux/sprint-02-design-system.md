# SPR-02 — Diseño visual y componentes

Estado: aprobado — CP-01B cerrada el 2026-09-12  
Dirección: **Midnight Training Console**  
Alcance: tokens, tipografía, componentes, variantes, estados, responsive y prototipo de alta fidelidad  
No incluye: React, Supabase, datos reales, dependencias de producción ni implementación frontend

## Brief de diseño

**Sujeto:** registro de entrenamiento de fuerza para una persona que usa el teléfono entre series.  
**Audiencia primaria:** Tayron, deportista constante que conoce sus ejercicios y necesita consultar la última sesión sin perder ritmo.  
**Trabajo único de la interfaz:** convertir una serie preparada en un registro confirmado en menos de ocho segundos, sin ocultar si todavía no llegó a la nube.

La pantalla de workout activo tiene prioridad visual. El historial se lee; la rutina se edita. Los números de peso, repeticiones, RIR y progreso deben ser comparables antes que decorativos.

## Dirección visual elegida

### Primera exploración

Se compararon tres direcciones breves:

1. **Kinetic Ledger:** libreta de entrenamiento de papel de tiza, tinta azul-marino y marcas óxido. Es específica, pero no coincide con la referencia visual entregada.
2. **Midnight Training Console:** panel azul-negro, superficies profundas, cian de acción, ámbar para PR y una escala compacta inspirada en interfaces de dispositivos de entrenamiento.
3. **Editorial de rendimiento:** columnas densas, reglas finas y serif protagonista. Ayuda al historial, pero trata la operación de registrar una serie como lectura editorial y no como una acción rápida con una mano.

### Decisión y crítica

Se revisa la elección hacia **Midnight Training Console** para acercarse a la referencia proporcionada: fondo azul-negro, tarjetas compactas, cian como señal primaria y números más pequeños. La firma visual pasa a ser el **cyan load rail**, una guía lateral y horizontal con marcas de series: cada marca representa una serie real y se activa al confirmar; comunica progreso sin convertir la pantalla en un dashboard genérico.

La primera propuesta se ajustó por dos señales concretas del propietario: el tema claro no se parecía suficientemente a la referencia y la escala de títulos competía con los datos. Se adopta una superficie oscura sin fotografía de fondo dentro de la app, se reduce la escala mobile y se deja el cian como una sola señal de acción. La imagen de montañas se usa como atmósfera de referencia, no como asset obligatorio del producto.

## Sistema de tokens

### Color

| Token | Hex base | Uso |
|---|---|---|
| `night` | `#081722` | Lienzo azul-negro y fondo de la app |
| `panel` | `#0F2230` | Superficies de lectura, tarjetas y controles |
| `ink` | `#F2F8FC` | Texto principal y números operativos |
| `cyan` | `#27D4FF` | Acción primaria, foco, progreso y navegación activa |
| `teal` | `#56C9BA` | Guardado confirmado y series completas |
| `amber` | `#F4C84A` | PR, RIR y alertas que necesitan atención |

Reglas:

- Texto principal usa `ink` sobre `night` o `panel`; los datos secundarios usan `#91A9B8` con contraste revisado.
- `cyan`, `teal` y `amber` se reservan para señales cortas y siempre se acompañan de texto, forma o posición.
- Error de red usa una variante rosa derivada de `amber`/`cyan` con borde, texto y mensaje explícito; no depende solo del color.
- El tema `dim gym` profundiza el mismo azul-negro y conserva la semántica de cyan, teal y amber.

### Tipografía

| Rol | Familia | Peso | Uso |
|---|---|---:|---|
| Display operativo | `Manrope`, fallback `Segoe UI` | 600–700 | H1 y títulos breves, sin dominar los datos |
| Lectura | `Inter`, fallback `Segoe UI` | 400–600 | Etiquetas, ayuda, navegación y mensajes |
| Datos | `IBM Plex Mono`, fallback `Consolas` | 400–500 | Peso, reps, RIR, fechas, e1RM y estados técnicos |

La geometría limpia de Manrope acompaña la referencia sin copiarla; Inter mantiene lectura rápida en pantallas pequeñas; la monoespaciada alinea números comparables. La interfaz no usa cursivas ni más de tres pesos.

### Escala y espaciado

| Token | Valor | Uso |
|---|---:|---|
| `space-1` | 4 px | separación interna mínima |
| `space-2` | 8 px | relación label-control y acciones cercanas |
| `space-3` | 12 px | fila de set y grupos compactos |
| `space-4` | 16 px | padding base de superficie |
| `space-6` | 24 px | separación de secciones |
| `space-8` | 32 px | respiración de página |
| `space-12` | 48 px | encabezados y cambios de contexto |

La escala tipográfica parte de 11/12/14/16/20/26/40 px. En 360 y 390 px, el título de pantalla queda entre 24 y 28 px; los números operativos solo crecen cuando expresan una métrica primaria.

### Forma y profundidad

- Bordes de 1 px para separar, no para decorar.
- `radius-sm: 4 px` en inputs, botones y estados.
- `radius-md: 10 px` solo en superficies de agrupación y diálogos.
- Sombras suaves únicamente para el shell flotante del prototipo; la app productiva prioriza bordes y contraste.
- La firma `cyan load rail` usa una regla vertical u horizontal y marcas compactas, nunca una barra de progreso genérica.

## Layout responsive

| Ancho | Composición | Decisión principal |
|---:|---|---|
| 360 px | una columna | una serie por fila, bottom nav, acción de confirmar siempre visible |
| 390 px | una columna amplia | referencia de última vez y campos primarios comparten la tarjeta |
| 768 px | shell compacto | navegación lateral estrecha y contenido en una columna para evitar compresión |
| 1280 px | shell completo | sidebar, contenido de trabajo y columna de evidencia/progreso |

La navegación móvil conserva Inicio, Rutinas, Entrenar, Historial y Progreso. Ejercicios y Ajustes permanecen en el menú secundario. En workout activo, el CTA de confirmar no se desplaza fuera del alcance del pulgar.

## Componentes y variantes

| Componente | Variantes | Estados obligatorios | Regla de uso |
|---|---|---|---|
| `AppShell` | móvil, escritorio, tema dim | sesión cargando, sesión activa | mantiene contexto sin competir con el workout |
| `PrimaryButton` | primary, quiet, destructive | default, pressed, disabled, loading | una acción primaria por grupo |
| `TextField` | peso, reps, RIR, texto | vacío, foco, inválido, disabled | etiqueta visible; input numérico con unidad cercana |
| `StatusBanner` | saved, attention, error, neutral | anunciable y accionable | texto + borde + acción; nunca solo color |
| `RoutineCard` | compacta, expanded, archived | loading, vacío, inválida, lista | edita plantilla; nunca pretende ser historial |
| `SetRow` | warmup, approach, working | draft, saving, saved, error, PR | la fila es la unidad de trabajo más frecuente |
| `LoadRail` | 1–5 marcas, completado, actual | vacío, parcial, completo | codifica series reales, no porcentaje inventado |
| `MetricBlock` | duración, volumen, e1RM, series | loading, empty, value | label pequeña + número alineado |
| `ChartPanel` | 30 días, 6 meses | loading, empty, populated, many points | el gráfico siempre tiene tabla/resumen equivalente |
| `BottomNav` | móvil | active, inactive, workout emphasis | cinco destinos fijos, sin icono sin texto |
| `Dialog` | confirm discard, delete, unsaved | open, close, error | solo para pérdida o efecto irreversible |

## Componente crítico: `SetRow`

Orden visual y semántico:

1. `LoadRail` y número de serie.
2. Tipo: calentamiento, aproximación o trabajo.
3. Referencia “Última vez” cuando existe.
4. Campo de peso con unidad visible.
5. Campo de repeticiones.
6. RIR opcional, de menor peso visual.
7. Acción de confirmar de al menos 44 × 44 CSS px.
8. Estado: `Guardando`, `Guardada` o `No guardada` con explicación.

En 360 px, peso y reps permanecen en la misma fila con ancho mínimo suficiente para `kg` y `reps`; RIR pasa debajo. La confirmación se compacta a un control de 48 px con `✓`, `↻` o `+` según estado, mantiene una etiqueta accesible y evita truncar texto. Confirmar la fila conserva el valor, mueve el foco a la siguiente entrada útil y activa el descanso derivado. Un error conserva todos los campos y muestra `Reintentar` en la propia fila.

## Estados y copy

| Situación | Copy principal | Acción |
|---|---|---|
| Cargando | `Cargando tu workout` | ninguna o cancelar solo si existe salida segura |
| Guardado | `Serie guardada` | continuar |
| Guardando | `Guardando…` | botón temporalmente bloqueado |
| Error de red | `No se guardó la serie` | `Reintentar` |
| Rutina vacía | `Añade un ejercicio para empezar` | `Añadir ejercicio` |
| Historial vacío | `Aquí aparecerán tus workouts` | `Crear una rutina` |
| Progreso vacío | `Completa un workout para ver progreso` | `Empezar entrenamiento` |
| Workout activo existente | `Ya tienes un workout activo` | `Continuar workout` |

El producto usa verbos concretos y voz activa. No usa “Oops”, “Algo salió mal” sin explicación ni estados de éxito que oculten la persistencia real.

## Tema dim gym

El prototipo usa el tema oscuro como base, siguiendo la referencia. `dim gym` es una variante todavía más profunda para validar contraste, no una segunda identidad. Se conservan cyan, teal y amber; la preferencia queda fuera de la persistencia de V1 hasta que exista implementación.

## Accesibilidad y calidad visual

- Contraste objetivo WCAG 2.2 AA para texto normal y controles.
- Foco visible de 3 px con desplazamiento de 2 px.
- Áreas táctiles mínimas de 44 × 44 CSS px.
- Todos los controles tienen texto visible o etiqueta accesible.
- Los estados se comunican por texto, borde y estructura, no solo por color.
- `aria-live="polite"` para guardado y cambios de estado; `role="alert"` para error de validación.
- Respeto de `prefers-reduced-motion`; no hay animación necesaria para entender el dato.
- La gráfica ofrece tabla equivalente y no depende de hover.
- El prototipo se inspecciona a 360/390/768/1280 px.
- En mobile se respeta `env(safe-area-inset-bottom)` para que la navegación no cubra contenido ni controles del sistema.

## Pantallas de alta fidelidad

El prototipo está en `docs/ux/sprint-02-high-fidelity.html` y cubre:

- acceso;
- inicio con workout activo;
- lista y edición de rutinas;
- workout activo y `SetRow` en estado guardado/error;
- resumen completado;
- historial y detalle snapshot;
- progreso con rango corto y rango amplio;
- ajustes, tema dim y validación responsive.

## Evidencia de CP-01B

- [x] Dirección visual específica al dominio y crítica de alternativas documentada.
- [x] Tokens de color, tipografía, espaciado, forma y profundidad definidos.
- [x] Componentes, variantes y estados definidos.
- [x] Componente de serie y plate index especificados.
- [x] Tema dim gym documentado y representado.
- [x] Prototipo de alta fidelidad creado.
- [x] Viewport selector para 360/390/768/1280 incluido.
- [x] Revisión visual de Tayron completada; se corrigieron los problemas responsive del `SetRow` mobile.
- [x] Aprobación formal de CP-01B recibida el 2026-09-12.

## No objetivos

- No se creó frontend de producción.
- No se instalaron fuentes, librerías ni dependencias.
- No se conectó ningún backend.
- No se modificó el alcance del producto ni la especificación maestra.
- CP-01B está cerrada. SPR-03 requiere una orden independiente antes de iniciar.
