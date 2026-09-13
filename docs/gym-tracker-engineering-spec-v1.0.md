# Ingeniería de software del Gym Tracker

> Especificación maestra del producto y plan de construcción  
> Propietario del producto: Tayron Cuéllar  
> Versión: 1.0 línea base aprobada  
> Fecha: 12 de septiembre de 2026  
> Estado: Puerta 0, CP-01B, CP-02A, CP-02B, CP-02C y CP-02D aprobadas; SPR-02, SPR-03, SPR-04, SPR-05 y SPR-06 terminados

---

## 0. Cómo usar este documento

Este archivo es la fuente de verdad para diseñar, construir, probar y desplegar una aplicación web de registro de entrenamientos de fuerza. Está preparado para mantenerse dentro del repositorio y ser leído por Tayron, Codex y cualquier colaborador futuro.

El documento adapta el marco genérico de Pressman y Maxim —comunicación, planeación, modelado, construcción y despliegue— a un proceso ágil de sprints. Las actividades sombrilla de seguimiento, gestión de riesgos, aseguramiento de calidad, revisiones técnicas, medición, gestión de configuración, reutilización y preparación de entregables se ejecutan durante todo el proyecto.

### 0.1 Reglas de gobierno

1. Este archivo manda sobre prompts, conversaciones y supuestos informales.
2. Una decisión solo está cerrada si aparece con estado APROBADA.
3. La implementación no comienza mientras exista una decisión PENDIENTE de prioridad bloqueante.
4. Cada requisito debe tener al menos una historia de usuario y una prueba asociada.
5. Ningún sprint termina por “tener código”; termina cuando cumple su puerta de salida y presenta evidencia verificable.
6. Los cambios de alcance se registran en la sección 25 antes de modificar código.
7. Los datos históricos de entrenamientos tienen prioridad sobre la comodidad de editar plantillas.

### 0.2 Estados utilizados

| Estado | Significado |
|---|---|
| APROBADA | Tayron ya lo decidió en la conversación previa o se deriva sin ambigüedad de una restricción aprobada. |
| PROPUESTA | Decisión técnica recomendada incluida en esta línea base candidata. Se aprueba al aprobar el documento. |
| PENDIENTE | Requiere una respuesta explícita antes de implementar. |
| FUERA V1 | No se desarrollará en la primera versión. |
| FUTURO | Idea preservada, sin compromiso de implementación. |

### 0.3 Convenciones de trazabilidad

| Prefijo | Elemento |
|---|---|
| OBJ | Objetivo del producto |
| ACT | Actor |
| RN | Regla de negocio |
| RF | Requisito funcional |
| RNF | Requisito no funcional |
| HU | Historia de usuario |
| CA | Criterio de aceptación |
| CU | Caso de uso |
| ADR | Decisión de arquitectura |
| PRU | Prueba |
| RSK | Riesgo |
| SPR | Sprint |
| CP | Puerta de control |

---

## 1. Línea base ejecutiva

### 1.1 Problema

Una persona que entrena fuerza necesita registrar peso, repeticiones y series con muy poca fricción, consultar qué hizo la última vez y comprobar progreso real. Las notas genéricas o las hojas de cálculo permiten almacenar datos, pero dificultan comparar sesiones, detectar récords, calcular volumen y mantener rutinas sin alterar el historial.

### 1.2 Solución

Una aplicación web móvil, privada y alojada en la nube que permite:

- crear y organizar rutinas;
- comenzar un entrenamiento desde una rutina o desde cero;
- registrar series de aproximación y trabajo con peso, repeticiones y RIR opcional;
- recuperar el último rendimiento del mismo ejercicio;
- conservar un historial inmutable frente a cambios posteriores de las rutinas;
- detectar récords personales;
- visualizar progresión y series semanales por músculo;
- usar un temporizador de descanso sin almacenar una entidad adicional.

### 1.3 Decisión de producto

La V1 no intenta combinar un registrador de fuerza, nutrición, red social, entrenador por IA y plataforma de wearables. Resuelve con calidad el ciclo completo de un entrenamiento de fuerza.

### 1.4 Restricciones aprobadas

| ID | Restricción | Estado |
|---|---|---|
| RES-01 | Coste de infraestructura inicial de 0 USD al mes, dentro de los límites gratuitos de los proveedores. | APROBADA |
| RES-02 | La aplicación funciona en la nube; no se implementa modo offline. | APROBADA |
| RES-03 | Experiencia mobile-first, utilizable durante el entrenamiento con una mano. | APROBADA |
| RES-04 | Peso y repeticiones son obligatorios para completar una serie; RIR es opcional. | APROBADA |
| RES-05 | Rutina y entrenamiento realizado son entidades diferentes; editar una rutina nunca reescribe el historial. | APROBADA |
| RES-06 | UI/UX, frontend, backend, integración y refactorización se trabajan como etapas separadas y verificables. | APROBADA |
| RES-07 | El proyecto se preparará para ser implementado y mantenido desde VS Code con Codex. | APROBADA |

### 1.5 Stack congelado

| Capa | Tecnología | Estado |
|---|---|---|
| Lenguaje | TypeScript con modo estricto | APROBADA |
| Frontend | React y Vite | APROBADA |
| Navegación | React Router | APROBADA |
| Estilos | Tailwind CSS v4 | APROBADA |
| Componentes base | shadcn/ui, personalizados para el producto | APROBADA |
| Iconos | Lucide React | APROBADA |
| Datos remotos | TanStack Query | APROBADA |
| Formularios | React Hook Form y Zod | APROBADA |
| Gráficas | Recharts, cargado de forma diferida | APROBADA |
| Backend administrado | Supabase | APROBADA |
| Base de datos | PostgreSQL de Supabase | APROBADA |
| Autenticación | Supabase Auth | APROBADA |
| Seguridad de datos | PostgreSQL Row Level Security | APROBADA |
| Hosting | Cloudflare Pages | APROBADA |
| Repositorio | GitHub | APROBADA |
| Pruebas frontend | Vitest y React Testing Library | APROBADA |
| Pruebas end-to-end | Playwright | APROBADA |
| Pruebas de base de datos | pgTAP mediante Supabase CLI | APROBADA |
| Integración continua | GitHub Actions | APROBADA |

### 1.6 Criterios de éxito de la V1

| ID | Indicador | Meta de aceptación |
|---|---|---|
| OBJ-01 | Registro rápido | Completar una serie ya preparada requiere como máximo dos entradas numéricas y un toque de confirmación. |
| OBJ-02 | Integridad histórica | El 100 % de los workouts completados conserva nombres, orden y objetivos originales aunque se edite o archive la rutina. |
| OBJ-03 | Recuperabilidad | Al recargar durante un workout activo, los datos confirmados reaparecen desde la nube. |
| OBJ-04 | Seguridad | Un usuario autenticado no puede leer ni modificar filas de otro usuario en ninguna tabla expuesta. |
| OBJ-05 | Exactitud analítica | PR, 1RM estimado, volumen y series semanales pasan todos los casos de prueba definidos. |
| OBJ-06 | Calidad de uso | Los cinco flujos críticos pasan en un teléfono de 360 px de ancho sin desbordamiento horizontal. |
| OBJ-07 | Rendimiento | LCP menor de 2.5 s en la ruta principal bajo el perfil móvil acordado y respuesta visual a una acción menor de 100 ms. |
| OBJ-08 | Estabilidad | Cero defectos críticos o altos abiertos antes del despliegue V1. |

---

## 2. Marco de proceso basado en Pressman

### 2.1 Adaptación utilizada

| Actividad de Pressman | Aplicación en este proyecto | Evidencia |
|---|---|---|
| Comunicación | Visión, alcance, actores, historias, criterios, glosario y decisiones. | Secciones 1 a 9 |
| Planeación | Estimación, backlog, cronograma, recursos, riesgos y puertas. | Secciones 18 a 22 |
| Modelado | Dominio, datos, arquitectura, navegación, interfaces y contratos. | Secciones 10 a 17 |
| Construcción | Convenciones, pruebas, integración continua y sprints. | Secciones 19 a 23 |
| Despliegue | Ambientes, publicación, observabilidad, soporte y aprendizaje. | Secciones 21 y 23 |

### 2.2 Actividades sombrilla

| Actividad | Política del proyecto |
|---|---|
| Seguimiento y control | Actualizar tablero, bloqueos y estado de requisitos al cierre de cada jornada de desarrollo. |
| Gestión de riesgos | Revisar el registro RSK al inicio y cierre de cada sprint. |
| Aseguramiento de calidad | Ningún cambio entra a main sin lint, tipos, pruebas aplicables y revisión del diff. |
| Revisiones técnicas | Revisar requisitos antes del diseño, modelo antes de migraciones y contratos antes de integrar. |
| Medición | Registrar velocidad, defectos escapados, cobertura de flujos críticos y Web Vitals. |
| Gestión de configuración | Git, ramas cortas, cambios por pull request y migraciones SQL versionadas. |
| Reutilización | Adoptar componentes base accesibles, funciones puras para métricas y adaptadores de datos. |
| Preparación de entregables | Mantener README, ADR, migraciones, pruebas y manual de despliegue junto al código. |

### 2.3 Modelo de ciclo de vida

Se usa un modelo incremental ágil con disciplina documental. La secuencia respeta la preferencia de trabajar capas separadas, pero cada etapa produce un incremento demostrable mediante repositorios simulados hasta la integración real.

~~~mermaid
flowchart TD
    A["Comunicación y línea base"] --> B["UX y diseño visual"]
    B --> C["Frontend con datos simulados"]
    C --> D["Backend y seguridad"]
    D --> E["Integración y analítica"]
    E --> F["Refactorización y despliegue"]
    F --> G["Evaluación y siguiente incremento"]
~~~

---

## 3. Visión, alcance y contexto

### 3.1 Visión

Para personas que entrenan fuerza y quieren progresar con datos, Gym Tracker es una aplicación web privada que convierte cada serie registrada en historial útil. A diferencia de una nota o plantilla que cambia con el tiempo, conserva lo que realmente ocurrió y presenta la información necesaria durante la sesión sin distraer al usuario.

### 3.2 Actores

| ID | Actor | Responsabilidad o interés |
|---|---|---|
| ACT-01 | Deportista autenticado | Configura preferencias, rutinas y ejercicios; registra y consulta sus propios datos. |
| ACT-02 | Propietario del producto | Prioriza alcance, acepta incrementos y aprueba cambios. Inicialmente Tayron. |
| ACT-03 | Desarrollador | Implementa, prueba, documenta y despliega. Inicialmente Tayron con Codex. |
| ACT-04 | Supabase Auth | Autentica y mantiene la sesión. |
| ACT-05 | PostgreSQL y Supabase API | Persiste datos, aplica restricciones y autoriza por fila. |
| ACT-06 | Cloudflare Pages | Construye y sirve el frontend. |

### 3.3 Dentro de la V1

- registro, inicio de sesión, cierre de sesión, recuperación y confirmación de cuenta;
- perfil mínimo con nombre visible, unidad de peso, zona horaria y comienzo de semana;
- catálogo de ejercicios del sistema y ejercicios personalizados;
- músculos primarios y secundarios informativos;
- creación, edición, orden, duplicación y archivo de rutinas;
- workout desde rutina o vacío;
- añadir, reordenar y retirar ejercicios durante una sesión activa;
- series de calentamiento, aproximación y trabajo;
- peso, repeticiones y RIR opcional;
- temporizador de descanso derivado del último completed_at;
- autoguardado en la nube al confirmar cada serie;
- último workout comparable;
- historial, detalle y eliminación confirmada de workouts;
- PR de peso, PR de repeticiones para un peso y PR de 1RM estimado;
- gráfica de 1RM estimado por ejercicio;
- series de trabajo semanales por músculo primario;
- diseño adaptable, estados de carga, vacío, error y reintento;
- seguridad RLS, pruebas y despliegue continuo.

### 3.4 Fuera de la V1

| Elemento | Estado | Motivo |
|---|---|---|
| Funcionamiento offline y sincronización | FUERA V1 | Restricción explícita; complejidad sin beneficio actual. |
| Nutrición y calorías | FUERA V1 | Producto distinto. |
| Red social, seguidores y rutinas públicas | FUERA V1 | Rompe el modelo privado y amplía moderación y seguridad. |
| Pagos y suscripciones | FUERA V1 | El objetivo inicial es coste cero y uso personal o pequeño. |
| Entrenamiento cardiovascular por tiempo o distancia | FUERA V1 | La V1 usa peso y repeticiones. |
| Fotos, medidas y peso corporal | FUERA V1 | No se requieren para validar el ciclo de entrenamiento. |
| Recomendaciones generadas por IA | FUERA V1 | Requieren datos suficientes y evaluación adicional. |
| Eliminación de cuenta y datos desde la interfaz | FUERA V1 | Decisión explícita del propietario para mantener fuera este flujo en V1. |
| Wearables | FUTURO | Depende de APIs externas y nuevos tipos de dato. |
| Entrenadores con clientes | FUTURO | Introduce roles, compartición y autorización compleja. |

### 3.5 Decisiones aprobadas de la línea base

| ID | Supuesto | Estado |
|---|---|---|
| DEC-01 | Nombre de trabajo: Gym Tracker; el nombre comercial se elegirá después sin afectar el dominio. | APROBADA |
| DEC-02 | Idioma inicial de la interfaz: español. | APROBADA |
| DEC-03 | Semana de entrenamiento: lunes a domingo. | APROBADA |
| DEC-04 | Zona horaria predeterminada: America/La_Paz; editable en perfil. | APROBADA |
| DEC-05 | Unidad predeterminada: kg; se almacena una magnitud canónica en kg y se convierte solo para mostrar y editar. | APROBADA |
| DEC-06 | La V1 admite cuentas múltiples, pero toda información de entrenamiento es privada por propietario. | APROBADA |
| DEC-07 | Se admite un solo workout activo por usuario. | APROBADA |
| DEC-08 | No existe panel de administrador en la V1. Los catálogos del sistema se cargan por migraciones. | APROBADA |

### 3.6 Estudio de viabilidad

| Dimensión | Evaluación | Condición de viabilidad |
|---|---|---|
| Técnica | Alta. El stack cubre SPA, autenticación, datos relacionales, seguridad por fila y hosting estático. | Probar temprano transacciones, RLS y vistas seguras. |
| Económica | Alta para V1. Todas las piezas seleccionadas tienen una ruta gratuita. | Vigilar límites y no asumir que permanecerán iguales. |
| Operativa | Alta. El usuario objetivo ya registra entrenamientos y dispone de internet móvil. | El flujo de serie debe superar la prueba de ≤ 8 s. |
| Cronograma | Media. Un solo desarrollador reduce coordinación pero limita capacidad. | Medir velocidad tras dos sprints y recortar Should antes de comprometer fecha. |
| Seguridad | Media-alta si RLS es parte del diseño. | Ninguna tabla o view se libera sin pruebas A/B/anon. |
| Legal y privacidad | Alta para uso personal con datos mínimos. | No presentar métricas como consejo médico ni añadir tracking sin decisión. |
| Mantenibilidad | Alta con dominio puro y adaptadores. | Respetar límites de módulos y Definition of Done. |

**Conclusión:** la V1 es viable. Los riesgos dominantes no son de tecnología sino de ampliación de alcance, autorización incorrecta y experiencia móvil insuficientemente probada.

---

## 4. Personas y escenarios

### 4.1 Persona primaria

**Tayron, deportista constante.** Entrena varias veces por semana, conoce los ejercicios y quiere ver la sesión anterior sin navegar por muchas pantallas. En el gimnasio dispone de conexión a internet y normalmente usa el teléfono. Valora registrar 80 kg × 12 en segundos, distinguir aproximaciones de trabajo y comprobar progresión real.

### 4.2 Trabajos que el producto debe resolver

1. Cuando comienzo una sesión, quiero cargar la estructura de mi rutina para no escribirla de nuevo.
2. Cuando llego a un ejercicio, quiero ver inmediatamente lo que hice la última vez.
3. Cuando completo una serie, quiero guardarla con la menor cantidad posible de interacción.
4. Cuando mejoro, quiero saber exactamente qué récord superé.
5. Cuando cambio una rutina, quiero conservar intactos los entrenamientos antiguos.
6. Cuando reviso una semana o varios meses, quiero distinguir actividad de progreso.

### 4.3 Escenarios críticos

| Escenario | Resultado esperado |
|---|---|
| Iniciar Push A | Se crea un workout activo con una copia consistente de sus ejercicios y objetivos. |
| Registrar una serie | Se valida, guarda, confirma visualmente y comienza o reinicia el temporizador. |
| Recargar la página | El workout y las series confirmadas se reconstruyen desde Supabase. |
| Editar Push A un mes después | Los workouts anteriores siguen mostrando su snapshot original. |
| Intentar acceder a otro usuario | La base devuelve cero filas o deniega la mutación, incluso manipulando la solicitud. |
| Perder conexión al confirmar | La serie no se presenta como guardada; queda editable y aparece reintento explícito. |

---

## 5. Glosario del dominio

| Término | Definición normativa |
|---|---|
| Ejercicio | Movimiento reusable del catálogo, del sistema o creado por un usuario. |
| Rutina | Plantilla editable y reusable de ejercicios, objetivos y descansos. |
| Entrenamiento o workout | Sesión real con inicio, fin, estado y snapshot de la plantilla utilizada. |
| Ejercicio de workout | Aparición ordenada de un ejercicio dentro de una sesión concreta. |
| Serie o set | Unidad atómica: tipo, peso, repeticiones, RIR opcional y momento de finalización. |
| Serie de calentamiento | Preparación general; no cuenta en volumen ni récords. |
| Serie de aproximación | Acercamiento específico a la carga de trabajo; no cuenta en volumen ni récords. |
| Serie de trabajo | Serie efectiva; participa en historial comparable, volumen y récords. |
| RIR | Repeticiones en reserva estimadas al finalizar una serie. Opcional entre 0 y 10. |
| PR | Mejor marca histórica válida según una regla definida. |
| 1RM estimado | Estimación con Epley para series válidas de 1 a 15 repeticiones. |
| Volumen de carga | Suma de peso_kg × repeticiones de series de trabajo elegibles. |
| Series semanales | Conteo de series de trabajo asignadas al músculo primario. |
| Snapshot | Copia de atributos históricos que no deben cambiar al editar una plantilla o catálogo. |
| Archivar | Ocultar de la operación normal sin romper referencias históricas. |

---

## 6. Reglas de negocio

### 6.1 Cuenta y propiedad

| ID | Regla |
|---|---|
| RN-001 | Toda fila privada debe poder asociarse de forma comprobable con exactamente un auth.users.id. |
| RN-002 | Un usuario solo puede consultar o mutar sus filas; los ejercicios del sistema son legibles por usuarios autenticados. |
| RN-003 | Nunca se expone una clave service_role o secret key en navegador, repositorio o logs. |
| RN-004 | El cierre de sesión invalida la experiencia local y limpia caché sensible. |

### 6.2 Ejercicios y músculos

| ID | Regla |
|---|---|
| RN-010 | Un ejercicio del sistema no puede ser editado ni archivado por un usuario final. |
| RN-011 | Un ejercicio personalizado pertenece a un usuario y solo ese usuario puede modificarlo. |
| RN-012 | Los nombres se comparan sin distinguir mayúsculas y con espacios externos eliminados para evitar duplicados del mismo propietario. |
| RN-013 | Cada ejercicio debe tener exactamente un músculo primario en V1 y puede tener cero o más músculos secundarios. |
| RN-014 | Un ejercicio referenciado por rutinas o workouts se archiva; no se elimina físicamente. |
| RN-015 | La V1 usa seguimiento peso-repeticiones. En ejercicios de peso corporal, el peso representa carga externa añadida; 0 es válido. |

### 6.3 Rutinas

| ID | Regla |
|---|---|
| RN-020 | Una rutina debe tener nombre y al menos un ejercicio para iniciar un workout. |
| RN-021 | La misma rutina no puede contener dos veces el mismo ejercicio en V1. |
| RN-022 | La posición debe ser única y consecutiva dentro de una rutina después de reordenar. |
| RN-023 | Objetivos válidos: 1 a 20 series; 1 a 100 reps; mínimo ≤ máximo; RIR 0 a 10; descanso 0 a 3600 s. |
| RN-024 | Editar o archivar una rutina no altera workouts existentes. |
| RN-025 | Duplicar una rutina crea nuevos IDs y conserva valores y orden. |

### 6.4 Entrenamientos

| ID | Regla |
|---|---|
| RN-030 | Un usuario tiene como máximo un workout activo; se exige mediante índice único parcial. |
| RN-031 | Iniciar desde rutina es transaccional: crea workout y snapshots o no crea nada. |
| RN-032 | Un workout vacío puede iniciarse y necesita al menos una serie completada para finalizar. |
| RN-033 | finished_at es nulo mientras está activo y no puede preceder a started_at. |
| RN-034 | Solo workouts completados participan en estadísticas definitivas. |
| RN-035 | Descartar requiere confirmación, cambia a cancelled y lo excluye de historial normal y analítica. |
| RN-036 | Un workout completado es de solo lectura salvo notas. Corregir rendimiento histórico queda fuera de V1. |
| RN-037 | Nombre de rutina, ejercicio, músculo primario, objetivos y descanso se guardan como snapshot. |

### 6.5 Series

| ID | Regla |
|---|---|
| RN-040 | Una serie completada necesita weight_kg ≥ 0, reps ≥ 1, tipo válido y completed_at. |
| RN-041 | Peso se almacena en kg con precisión 0.001; la interfaz redondea según preferencia. |
| RN-042 | RIR es opcional; si existe, es entero de 0 a 10. |
| RN-043 | set_number es único por ejercicio de workout y comienza en 1. |
| RN-044 | Solo series working completadas de workouts completados cuentan en métricas definitivas. |
| RN-045 | Una serie no confirmada no se presenta como guardada. |
| RN-046 | El doble toque no crea duplicados; cada alta usa UUID de cliente y bloqueo temporal. |

### 6.6 Tiempo y unidades

| ID | Regla |
|---|---|
| RN-050 | Las marcas temporales se almacenan en UTC mediante timestamptz. |
| RN-051 | Los límites de semana se calculan en la zona horaria del perfil. |
| RN-052 | Cambiar kg/lb cambia presentación e ingreso futuro, no datos históricos. |
| RN-053 | El temporizador se deriva de completed_at + rest_seconds; no existe tabla de timer. |

### 6.7 Analítica

| ID | Regla |
|---|---|
| RN-060 | Epley: e1RM_kg = weight_kg × (1 + reps / 30), solo para 1 a 15 reps y peso > 0. |
| RN-061 | PR de peso: mayor weight_kg en una serie working válida del ejercicio. |
| RN-062 | PR de reps por peso: mayor reps para carga equivalente, tolerancia 0.01 kg. |
| RN-063 | PR estimado: mayor Epley válido; empate dentro de 0.01 kg no crea nuevo PR. |
| RN-064 | Un PR es provisional durante el workout y definitivo al completarlo. |
| RN-065 | Última vez usa el workout completado más reciente anterior con el mismo exercise_id. |
| RN-066 | Beat Last Time se muestra por serie working ordinal usando e1RM; no hay puntuación global en V1. |
| RN-067 | Una serie semanal suma 1 al músculo primario snapshot; secundarios no suman en V1. |
| RN-068 | Volumen excluye calentamiento, aproximación y carga cero. |

---

## 7. Requisitos funcionales

### 7.1 Cuenta y sesión

| ID | Requisito | Prioridad |
|---|---|---|
| RF-001 | Registrar cuenta con correo y contraseña. | Must |
| RF-002 | Confirmar correo antes de usar datos privados en producción. | Must |
| RF-003 | Iniciar y cerrar sesión, restaurando sesión válida al recargar. | Must |
| RF-004 | Solicitar restablecimiento de contraseña. | Must |
| RF-005 | Editar nombre, unidad, zona horaria y comienzo de semana. | Must |
| RF-006 | Eliminar cuenta y datos mediante confirmación reforzada. | FUERA V1 |

### 7.2 Ejercicios

| ID | Requisito | Prioridad |
|---|---|---|
| RF-010 | Listar y buscar ejercicios por nombre. | Must |
| RF-011 | Filtrar por músculo primario y equipo. | Should |
| RF-012 | Crear y editar un ejercicio personalizado. | Must |
| RF-013 | Archivar y restaurar un ejercicio personalizado. | Should |
| RF-014 | Mostrar ficha con músculos, equipo, historial y marcas. | Must |

### 7.3 Rutinas

| ID | Requisito | Prioridad |
|---|---|---|
| RF-020 | Crear, renombrar, describir, duplicar, archivar y restaurar rutinas. | Must |
| RF-021 | Añadir, retirar y reordenar ejercicios. | Must |
| RF-022 | Configurar series objetivo, rango de reps, RIR, descanso y nota. | Must |
| RF-023 | Validar la rutina y explicar por qué no puede iniciarse. | Must |
| RF-024 | Consultar vista previa antes de comenzar. | Should |

### 7.4 Workout activo

| ID | Requisito | Prioridad |
|---|---|---|
| RF-030 | Iniciar workout desde rutina en una operación atómica. | Must |
| RF-031 | Iniciar workout vacío. | Should |
| RF-032 | Recuperar el único workout activo al recargar o volver a iniciar sesión. | Must |
| RF-033 | Añadir, reordenar o retirar ejercicios sin cambiar la rutina. | Must |
| RF-034 | Crear, editar antes de finalizar, eliminar y reordenar series. | Must |
| RF-035 | Marcar tipo warmup, approach o working. | Must |
| RF-036 | Registrar peso, reps y RIR opcional con teclado numérico. | Must |
| RF-037 | Mostrar la última sesión comparable junto al registro actual. | Must |
| RF-038 | Ejecutar temporizador y permitir reiniciar u omitirlo. | Must |
| RF-039 | Finalizar workout mostrando resumen y PR provisionales. | Must |
| RF-040 | Descartar workout activo mediante confirmación. | Must |
| RF-041 | Avisar cuando una mutación no llegó a nube y permitir reintento. | Must |

### 7.5 Historial y progreso

| ID | Requisito | Prioridad |
|---|---|---|
| RF-050 | Listar workouts completados en orden descendente y paginarlos. | Must |
| RF-051 | Ver detalle histórico usando snapshots. | Must |
| RF-052 | Añadir o editar notas de un workout completado. | Should |
| RF-053 | Eliminar un workout con confirmación y advertencia analítica. | Should |
| RF-054 | Consultar historial de un ejercicio por fecha. | Must |
| RF-055 | Mostrar PR de peso, reps por carga y 1RM estimado. | Must |
| RF-056 | Mostrar gráfica temporal de 1RM estimado por ejercicio. | Must |
| RF-057 | Mostrar series semanales por músculo primario. | Must |
| RF-058 | Mostrar resumen: duración, ejercicios, series, reps y volumen. | Must |

### 7.6 Sistema

| ID | Requisito | Prioridad |
|---|---|---|
| RF-060 | Presentar estados de carga, vacío, error, éxito y falta de autorización. | Must |
| RF-061 | Registrar errores sin contraseñas, tokens ni contenido sensible innecesario. | Must |
| RF-062 | Permitir navegación por URL sin perder sesión en rutas protegidas. | Must |

---

## 8. Requisitos no funcionales

| ID | Categoría | Requisito verificable |
|---|---|---|
| RNF-001 | Usabilidad | Un usuario familiarizado completa una serie preparada en ≤ 8 s. |
| RNF-002 | Usabilidad | Acciones primarias del workout tienen área táctil mínima de 44 × 44 CSS px. |
| RNF-003 | Adaptabilidad | Sin scroll horizontal a 360, 390, 768 y 1280 px. |
| RNF-004 | Accesibilidad | Cumple WCAG 2.2 AA aplicable: teclado, foco, contraste, etiquetas y mensajes anunciables. |
| RNF-005 | Rendimiento | LCP p75 < 2.5 s, CLS < 0.1 e INP < 200 ms en producción cuando sea medible. |
| RNF-006 | Rendimiento | Las rutas de gráficas cargan diferidas; el shell no importa Recharts. |
| RNF-007 | Disponibilidad | Fallos del proveedor se muestran como estado recuperable; nunca se finge persistencia. |
| RNF-008 | Seguridad | RLS probado para SELECT, INSERT, UPDATE y DELETE de cada tabla expuesta. |
| RNF-009 | Seguridad | Cero secretos privilegiados en bundle, historial Git o variables públicas. |
| RNF-010 | Privacidad | Datos privados por defecto; no existen URLs públicas de workouts. |
| RNF-011 | Integridad | Foreign keys, checks, unicidad y transacciones protegen invariantes. |
| RNF-012 | Mantenibilidad | TypeScript strict; lint y pruebas bloquean merge ante fallo. |
| RNF-013 | Mantenibilidad | Lógica de dominio y métricas no depende de React ni Supabase. |
| RNF-014 | Compatibilidad | Dos últimas versiones estables de Chrome, Edge, Firefox y Safari móvil al liberar. |
| RNF-015 | Calidad | Cobertura de ramas ≥ 90 % en métricas y ≥ 80 % en lógica de dominio. |
| RNF-016 | Observabilidad | Errores incluyen ruta, versión y operación, sin datos sensibles. |
| RNF-017 | Recuperación | Migraciones versionadas y respaldo verificado antes de cambios destructivos. |
| RNF-018 | Coste | Ninguna función V1 exige un plan pago para el uso previsto. |

---

## 9. Historias de usuario y criterios de aceptación

### Épica E1 Cuenta

#### HU-001 Crear cuenta — 5 puntos

Como visitante, quiero crear una cuenta para mantener mis entrenamientos privados y disponibles en la nube.

- CA-001: con correo válido y contraseña conforme, se crea la identidad y se informa que debe confirmar el correo.
- CA-002: un correo ya registrado produce un mensaje seguro sin detalles técnicos.
- CA-003: ante error se conserva el correo, se limpia la contraseña y se permite reintentar.

#### HU-002 Iniciar y cerrar sesión — 3 puntos

- CA-004: credenciales válidas navegan a /app.
- CA-005: una ruta protegida redirige al login sin sesión válida.
- CA-006: cerrar sesión limpia la caché privada y volver atrás no muestra datos anteriores.

#### HU-003 Recuperar contraseña — 3 puntos

- CA-007: puede solicitarse un enlace sin revelar si la dirección existe.
- CA-008: el enlace válido permite fijar una nueva contraseña.
- CA-009: un enlace vencido presenta una salida recuperable.

#### HU-004 Gestionar perfil — 3 puntos

- CA-010: se cambian nombre, kg/lb, zona horaria y comienzo de semana.
- CA-011: cambiar unidad no modifica weight_kg existente.
- CA-012: la preferencia se aplica en la siguiente visualización.

### Épica E2 Ejercicios

#### HU-010 Explorar ejercicios — 3 puntos

- CA-020: la búsqueda ignora mayúsculas y espacios externos.
- CA-021: los archivados no aparecen por defecto.
- CA-022: filtros pueden limpiarse sin recargar.

#### HU-011 Crear ejercicio personalizado — 5 puntos

- CA-023: nombre y músculo primario son obligatorios.
- CA-024: no se admite nombre normalizado duplicado para el propietario.
- CA-025: queda disponible inmediatamente en rutinas y workout activo.

#### HU-012 Editar o archivar ejercicio — 3 puntos

- CA-026: solo puede editarse un ejercicio propio.
- CA-027: archivar no modifica snapshots ni impide ver historial.
- CA-028: restaurar vuelve a mostrarlo en selectores.

### Épica E3 Rutinas

#### HU-020 Crear rutina — 5 puntos

- CA-030: nombre obligatorio de 1 a 80 caracteres.
- CA-031: puede guardarse borrador sin ejercicios, pero no iniciarse.
- CA-032: la lista refleja el alta sin recarga completa.

#### HU-021 Configurar ejercicios de rutina — 8 puntos

- CA-033: se añaden ejercicios sin duplicarlos.
- CA-034: se guarda orden, series, rango, RIR, descanso y nota.
- CA-035: se rechaza mínimo mayor que máximo y valores fuera de RN-023.
- CA-036: reordenar produce posiciones únicas y consecutivas.

#### HU-022 Duplicar y archivar rutina — 3 puntos

- CA-037: la copia incluye ejercicios y objetivos con IDs nuevos.
- CA-038: archivar la original no afecta copia ni historial.

### Épica E4 Workout activo

#### HU-030 Iniciar desde rutina — 8 puntos

- CA-040: se crea un workout con todos los snapshots o no se crea ninguno.
- CA-041: si ya existe uno activo se ofrece continuarlo; no se crea otro.
- CA-042: la pantalla abre el primer ejercicio y muestra objetivos y última vez.

#### HU-031 Recuperar workout activo — 5 puntos

- CA-043: tras recargar se reconstruyen ejercicios y series confirmadas.
- CA-044: el temporizador se recalcula usando última serie y descanso.
- CA-045: una serie fallida nunca aparece como guardada.

#### HU-032 Registrar y editar series — 8 puntos

- CA-046: peso y reps usan teclado numérico; RIR es opcional.
- CA-047: confirmar persiste una sola fila aunque haya doble toque.
- CA-048: éxito inequívoco y foco en la siguiente entrada útil.
- CA-049: editar o eliminar durante la sesión actualiza resumen y PR provisional.
- CA-050: valores inválidos no llegan al repositorio.

#### HU-033 Modificar estructura de sesión — 5 puntos

- CA-051: añadir, retirar o reordenar no cambia la rutina origen.
- CA-052: retirar un ejercicio con series pide confirmación.
- CA-053: snapshot sobrevive si el ejercicio original se archiva.

#### HU-034 Usar temporizador — 3 puntos

- CA-054: confirmar inicia descanso configurado.
- CA-055: recargar calcula el tiempo restante correcto.
- CA-056: sonido o vibración es mejora opcional y depende del permiso disponible.

#### HU-035 Finalizar o descartar — 5 puntos

- CA-057: no se finaliza sin una serie completada.
- CA-058: finalizar fija fecha, estado y muestra resumen.
- CA-059: descartar exige confirmación y excluye la sesión de analítica.

### Épica E5 Historial y analítica

#### HU-040 Consultar historial — 5 puntos

- CA-060: lista paginada y descendente con fecha local, rutina snapshot, duración y series.
- CA-061: detalle usa snapshots, no valores actuales de la rutina.
- CA-062: estado vacío explica cómo crear el primer workout.

#### HU-041 Ver última vez — 5 puntos

- CA-063: solo considera workouts completados anteriores.
- CA-064: muestra series working por orden y fecha local.
- CA-065: sin sesión previa muestra “Primera vez”.

#### HU-042 Detectar PR — 8 puntos

- CA-066: los tres tipos siguen RN-060 a RN-064.
- CA-067: se excluyen series no elegibles donde corresponde.
- CA-068: eliminar workout recalcula sin datos derivados obsoletos.

#### HU-043 Ver progreso — 5 puntos

- CA-069: la gráfica usa mejor e1RM elegible por workout y fecha local.
- CA-070: permite cambiar rango temporal y tiene estado vacío.
- CA-071: tabla y gráfica comunican la misma magnitud y unidad.

#### HU-044 Ver series semanales — 5 puntos

- CA-072: cuenta solo working sets de workouts completados.
- CA-073: usa músculo primario snapshot y semana del perfil.
- CA-074: navegar entre semanas no modifica datos.

#### HU-045 Gestionar workout histórico — 3 puntos

- CA-075: se editan notas, no el rendimiento.
- CA-076: eliminar exige acción explícita y advierte el efecto analítico.

### Épica E6 Calidad operativa

#### HU-050 Manejar errores y reintentos — 5 puntos

- CA-080: cada operación remota tiene carga, éxito y error perceptibles.
- CA-081: reintentar no duplica datos.
- CA-082: un error global conserva navegación y ofrece recuperación segura.

#### HU-051 Accesibilidad y teclado — 5 puntos

- CA-083: todo control es alcanzable y operable con teclado.
- CA-084: el foco vuelve al origen al cerrar un diálogo.
- CA-085: errores asociados al campo no dependen solo de color.

### 9.1 Backlog resumido

| Historia | Puntos | Prioridad | Dependencias |
|---|---:|---|---|
| HU-001 | 5 | Must | UI auth, Auth |
| HU-002 | 3 | Must | HU-001 |
| HU-003 | 3 | Must | HU-001 |
| HU-004 | 3 | Must | HU-002 |
| HU-010 | 3 | Must | sesión |
| HU-011 | 5 | Must | HU-010 |
| HU-012 | 3 | Should | HU-011 |
| HU-020 | 5 | Must | ejercicios |
| HU-021 | 8 | Must | HU-020 |
| HU-022 | 3 | Must | HU-021 |
| HU-030 | 8 | Must | rutina, RPC |
| HU-031 | 5 | Must | HU-030 |
| HU-032 | 8 | Must | HU-030 |
| HU-033 | 5 | Must | HU-030 |
| HU-034 | 3 | Must | HU-032 |
| HU-035 | 5 | Must | HU-032 |
| HU-040 | 5 | Must | HU-035 |
| HU-041 | 5 | Must | HU-040 |
| HU-042 | 8 | Must | HU-035 |
| HU-043 | 5 | Must | HU-042 |
| HU-044 | 5 | Must | HU-035 |
| HU-045 | 3 | Should | HU-040 |
| HU-050 | 5 | Must | transversal |
| HU-051 | 5 | Must | transversal |
| **Total** | **116** |  |  |

Los puntos expresan complejidad relativa, no horas. La velocidad se recalibra tras dos sprints con evidencia real.

---

## 10. Casos de uso detallados

### CU-01 Iniciar entrenamiento desde rutina

| Campo | Especificación |
|---|---|
| Actor | ACT-01 |
| Precondiciones | Autenticado; rutina propia activa y válida; sin workout activo. |
| Disparador | Toca “Empezar entrenamiento”. |
| Flujo principal | 1. Cliente valida sesión. 2. Invoca RPC con routine_id. 3. BD verifica propiedad y ausencia de activo. 4. Inserta workout. 5. Copia ejercicios y objetivos como snapshots. 6. Devuelve agregado. 7. Navega a /app/workout/active. |
| Alternativa A | Hay activo: conflicto de dominio y acción “Continuar”. |
| Alternativa B | Rutina vacía o archivada: rechazo con explicación. |
| Excepción | Falla remota: no navegar ni presentar éxito; reintentar la misma intención. |
| Postcondición | Existe exactamente un workout activo consistente. |
| Trazabilidad | RF-023, RF-030, RN-030, RN-031, HU-030, PRU-E2E-030 |

### CU-02 Completar una serie

| Campo | Especificación |
|---|---|
| Precondiciones | Workout activo propio; ejercicio presente. |
| Disparador | Confirmar en una fila de serie. |
| Flujo principal | 1. Zod valida. 2. Cliente convierte unidad a kg. 3. Genera UUID. 4. Bloquea doble envío. 5. Inserta. 6. BD aplica constraints y RLS. 7. Cliente confirma, invalida consultas y arranca descanso. |
| Alternativa | RIR vacío se guarda nulo; peso cero es válido. |
| Excepción | La fila queda no guardada, conserva entradas y muestra reintento. |
| Postcondición | Una única serie completada existe en nube y UI. |
| Trazabilidad | RF-034 a RF-038, RN-040 a RN-046, HU-032, PRU-E2E-032 |

### CU-03 Finalizar workout

| Campo | Especificación |
|---|---|
| Precondiciones | Activo con al menos una serie completada y sin mutaciones pendientes. |
| Flujo principal | 1. Confirma. 2. BD valida propiedad, estado y contenido. 3. Fija completed y finished_at. 4. Cliente invalida activo, historial y analítica. 5. Presenta resumen y PR. |
| Alternativa | Si quedan borradores, se informa y permite volver o descartarlos. |
| Excepción | Si falla, el workout sigue activo. |
| Trazabilidad | RF-039, RN-032 a RN-034, HU-035, PRU-E2E-035 |

### CU-04 Calcular último desempeño y PR

| Campo | Especificación |
|---|---|
| Precondiciones | Usuario autenticado y exercise_id visible. |
| Flujo principal | 1. Consultar series elegibles. 2. Identificar workout anterior. 3. Calcular e1RM. 4. Calcular máximos. 5. Presentar fecha y unidad. |
| Excepciones | Sin histórico es vacío válido. Serie no elegible permanece en historial pero no en cálculo. |
| Trazabilidad | RF-037, RF-054 a RF-057, RN-060 a RN-068, PRU-UNIT-METRICS |

---

## 11. Modelo de dominio y datos

### 11.1 Principio estructural

La rutina es una plantilla. El workout es una fotografía histórica. La serie es el hecho atómico. Las estadísticas son proyecciones calculadas, no fuentes de verdad duplicadas.

~~~mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : posee
    AUTH_USERS ||--o{ EXERCISES : crea
    EXERCISES ||--o{ EXERCISE_MUSCLES : activa
    MUSCLE_GROUPS ||--o{ EXERCISE_MUSCLES : clasifica
    AUTH_USERS ||--o{ ROUTINES : posee
    ROUTINES ||--o{ ROUTINE_EXERCISES : contiene
    EXERCISES ||--o{ ROUTINE_EXERCISES : referencia
    AUTH_USERS ||--o{ WORKOUTS : realiza
    WORKOUTS ||--o{ WORKOUT_EXERCISES : contiene
    EXERCISES ||--o{ WORKOUT_EXERCISES : identifica
    WORKOUT_EXERCISES ||--o{ SETS : registra
~~~

### 11.2 Tipos enumerados

| Tipo | Valores |
|---|---|
| weight_unit | kg, lb |
| equipment_type | barbell, dumbbell, machine, cable, bodyweight, band, other |
| movement_type | compound, isolation |
| muscle_role | primary, secondary |
| workout_status | active, completed, cancelled |
| set_type | warmup, approach, working |

### 11.3 Tabla profiles

| Columna | Tipo | Nulo | Regla |
|---|---|---:|---|
| id | uuid PK y FK auth.users | No | Mismo ID; cascade al borrar usuario. |
| display_name | varchar(80) | No | Trim, 1 a 80. |
| weight_unit | enum | No | Default kg. |
| timezone | text | No | Default America/La_Paz; IANA válida. |
| week_starts_on | smallint | No | 1 lunes a 7 domingo; default 1. |
| created_at | timestamptz | No | Default now. |
| updated_at | timestamptz | No | Trigger controlado. |

### 11.4 Tabla muscle_groups

| Columna | Tipo | Nulo | Regla |
|---|---|---:|---|
| id | smallint identity PK | No | Catálogo. |
| name | varchar(60) | No | Único. |
| slug | varchar(60) | No | Único y estable. |
| sort_order | smallint | No | Mayor o igual a 1. |

Semilla V1: pecho, espalda, cuádriceps, isquiosurales, glúteos, pantorrillas, bíceps, tríceps, deltoide anterior, deltoide lateral, deltoide posterior y abdominales.

### 11.5 Tabla exercises

| Columna | Tipo | Nulo | Regla |
|---|---|---:|---|
| id | uuid PK | No | UUID. |
| user_id | uuid FK auth.users | Sí | Nulo solo si is_system. |
| name | varchar(100) | No | Trim, 1 a 100. |
| normalized_name | text generado | No | Para unicidad y búsqueda. |
| equipment | enum | No | Default other. |
| movement_type | enum | No | Compuesto o aislamiento. |
| is_unilateral | boolean | No | Default false. |
| is_system | boolean | No | Coherente con user_id. |
| is_archived | boolean | No | Default false; sistema nunca se archiva por usuario. |
| notes | text | Sí | Máximo lógico 1000. |
| created_at | timestamptz | No | Default now. |
| updated_at | timestamptz | No | Trigger. |

Restricciones: is_system equivale a user_id nulo; unicidad parcial por normalized_name para sistema y por usuario para personalizados.

### 11.6 Tabla exercise_muscles

| Columna | Tipo | Nulo | Regla |
|---|---|---:|---|
| exercise_id | uuid FK exercises | No | Referencia. |
| muscle_group_id | smallint FK | No | Restrict. |
| role | enum | No | primary o secondary. |
| contribution | numeric(4,3) | No | Mayor que 0 y menor o igual a 1. |

Clave compuesta exercise_id y muscle_group_id. Índice único parcial garantiza un solo primary.

### 11.7 Tabla routines

| Columna | Tipo | Nulo | Regla |
|---|---|---:|---|
| id | uuid PK | No | UUID. |
| user_id | uuid FK | No | Propietario. |
| name | varchar(80) | No | Trim. |
| description | text | Sí | Máximo lógico 1000. |
| is_archived | boolean | No | Default false. |
| created_at | timestamptz | No | Default now. |
| updated_at | timestamptz | No | Trigger. |

Índice por usuario, archivo y fecha; unicidad normalizada entre rutinas activas.

### 11.8 Tabla routine_exercises

| Columna | Tipo | Nulo | Regla |
|---|---|---:|---|
| id | uuid PK | No | UUID. |
| routine_id | uuid FK | No | Cascade. |
| exercise_id | uuid FK | No | Restrict. |
| position | smallint | No | Mayor o igual a 1; única por rutina. |
| target_sets | smallint | No | 1 a 20; default 3. |
| rep_min | smallint | Sí | 1 a 100. |
| rep_max | smallint | Sí | 1 a 100 y mayor o igual a mínimo. |
| target_rir | smallint | Sí | 0 a 10. |
| rest_seconds | integer | Sí | 0 a 3600. |
| notes | text | Sí | Máximo lógico 1000. |
| created_at | timestamptz | No | Default now. |
| updated_at | timestamptz | No | Trigger. |

Unicidad por rutina y ejercicio, y por rutina y posición.

### 11.9 Tabla workouts

| Columna | Tipo | Nulo | Regla |
|---|---|---:|---|
| id | uuid PK | No | UUID generado antes de mutar. |
| user_id | uuid FK | No | Propietario. |
| routine_id | uuid FK | Sí | Al borrar, se vuelve nulo. |
| routine_name_snapshot | varchar(80) | Sí | Nombre al iniciar. |
| started_at | timestamptz | No | Default now. |
| finished_at | timestamptz | Sí | No anterior a inicio. |
| status | enum | No | Default active. |
| notes | text | Sí | Máximo lógico 2000. |
| created_at | timestamptz | No | Default now. |
| updated_at | timestamptz | No | Trigger y control de concurrencia. |

Índice por usuario y fecha descendente. Índice único parcial de usuario donde estado sea active.

### 11.10 Tabla workout_exercises

| Columna | Tipo | Nulo | Regla |
|---|---|---:|---|
| id | uuid PK | No | UUID. |
| workout_id | uuid FK | No | Cascade. |
| exercise_id | uuid FK | No | Restrict. |
| routine_exercise_id | uuid FK | Sí | Al borrar, se vuelve nulo. |
| exercise_name_snapshot | varchar(100) | No | Inmutable. |
| primary_muscle_id_snapshot | smallint FK | No | Restrict. |
| position | smallint | No | Mayor o igual a 1; única por workout. |
| target_sets_snapshot | smallint | Sí | 1 a 20. |
| rep_min_snapshot | smallint | Sí | 1 a 100. |
| rep_max_snapshot | smallint | Sí | Mayor o igual a mínimo. |
| target_rir_snapshot | smallint | Sí | 0 a 10. |
| rest_seconds_snapshot | integer | Sí | 0 a 3600. |
| notes_snapshot | text | Sí | Copia inicial. |
| created_at | timestamptz | No | Default now. |

Unicidad por workout y ejercicio, y por workout y posición.

### 11.11 Tabla sets

| Columna | Tipo | Nulo | Regla |
|---|---|---:|---|
| id | uuid PK | No | Generado por cliente para idempotencia práctica. |
| workout_exercise_id | uuid FK | No | Cascade. |
| set_number | smallint | No | 1 a 100; único por ejercicio de workout. |
| set_type | enum | No | Default working. |
| weight_kg | numeric(8,3) | No | 0 a 2000. |
| reps | smallint | No | 1 a 1000; e1RM limita a 15. |
| rir | smallint | Sí | 0 a 10. |
| is_completed | boolean | No | Default true para altas V1. |
| completed_at | timestamptz | Sí | Obligatorio si completed. |
| notes | text | Sí | Máximo lógico 500. |
| created_at | timestamptz | No | Default now. |
| updated_at | timestamptz | No | Trigger. |

Unicidad por workout_exercise_id y set_number. Check lógico: completed exige completed_at; no completada exige completed_at nulo.

### 11.12 Ciclo de vida

~~~mermaid
stateDiagram-v2
    [*] --> active
    active --> completed: finalizar
    active --> cancelled: descartar
    completed --> [*]
    cancelled --> [*]
~~~

No se permite regresar a active. Solo completed participa en métricas.

### 11.13 Vistas y funciones derivadas

| Nombre | Tipo | Responsabilidad |
|---|---|---|
| v_exercise_history | View security invoker | Series válidas del usuario con workout y ejercicio. |
| v_workout_summary | View security invoker | Duración, ejercicios, working sets, reps y volumen. |
| v_weekly_muscle_sets | View security invoker | Conteo semanal por músculo primario snapshot. |
| v_exercise_best_sets | View security invoker | Máximos de peso y e1RM; no persiste PR. |
| start_workout_from_routine | Función RPC transaccional | Verificar propietario, activo y rutina; crear snapshots. |
| complete_workout | Función RPC transaccional | Validar contenido y transición a completed. |
| duplicate_routine | Función RPC transaccional | Copiar rutina y elementos con posiciones consistentes. |

Todas las vistas expuestas deben usar security_invoker en PostgreSQL compatible. No se crean tablas personal_records, weekly_volume o statistics en V1.

---

## 12. Arquitectura

### 12.1 Contexto

~~~mermaid
flowchart LR
    U["Usuario"] --> W["React SPA"]
    W --> A["Supabase Auth"]
    W --> P["PostgreSQL API y RPC"]
    P --> D["PostgreSQL con RLS"]
    G["GitHub"] --> C["Cloudflare Pages"]
    C --> W
~~~

### 12.2 Contenedores lógicos

| Contenedor | Responsabilidad | No debe hacer |
|---|---|---|
| UI React | Render, interacción, accesibilidad y navegación. | SQL, fórmulas duplicadas, acceso privilegiado. |
| Aplicación | Casos de uso, orquestación, Query hooks y validación de flujo. | Render ni dependencia directa de componentes. |
| Dominio | Entidades, reglas, conversiones y métricas puras. | Importar React, Supabase o navegador. |
| Infraestructura | Cliente Supabase y adaptadores de repositorio. | Decidir reglas de negocio. |
| PostgreSQL | Integridad, propiedad, transacciones, RLS y consultas eficientes. | Presentación. |

### 12.3 Dependencias permitidas

~~~mermaid
flowchart TD
    UI["UI y páginas"] --> APP["Casos de uso"]
    APP --> DOM["Dominio puro"]
    APP --> PORT["Puertos de repositorio"]
    INFRA["Adaptadores Supabase o mock"] --> PORT
    INFRA --> DOM
~~~

El dominio no conoce capas externas. La UI consume casos de uso o hooks, nunca el cliente Supabase directamente.

### 12.4 Estructura del repositorio

~~~text
/
├── docs/
│   ├── engineering-spec.md
│   └── adr/
├── public/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── router/
│   │   └── styles/
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── exercises/
│   │   ├── routines/
│   │   ├── active-workout/
│   │   ├── history/
│   │   └── progress/
│   ├── domain/
│   │   ├── metrics/
│   │   ├── units/
│   │   ├── validation/
│   │   └── types/
│   ├── infrastructure/
│   │   ├── supabase/
│   │   ├── repositories/
│   │   └── telemetry/
│   ├── test/
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/
├── e2e/
├── .env.example
└── README.md
~~~

### 12.5 Decisiones ADR

| ID | Decisión | Razón | Consecuencia |
|---|---|---|---|
| ADR-001 | SPA React/Vite en vez de Next.js. | Producto autenticado sin necesidad de SSR o SEO de contenido. | Menos infraestructura; rutas SPA requieren fallback. |
| ADR-002 | Supabase en vez de backend Node propio. | Auth, Postgres, API y RLS con coste inicial cero. | Dependencia administrada y límites de plan. |
| ADR-003 | PostgreSQL relacional. | Rutinas, workouts, ejercicios y sets tienen relaciones e integridad fuerte. | Migraciones y joins explícitos. |
| ADR-004 | Snapshots históricos. | Plantillas editables no deben cambiar hechos. | Duplicación intencional de campos históricos. |
| ADR-005 | Estadísticas derivadas. | Evita inconsistencias al editar o eliminar. | Consultas y funciones deben optimizarse. |
| ADR-006 | Repositorio abstracto con mock en frontend. | Permite completar UI antes del backend. | Hay que mantener contratos idénticos. |
| ADR-007 | RPC para operaciones multitabla. | Inicio, duplicación y finalización deben ser atómicos. | SQL y pruebas de función obligatorios. |
| ADR-008 | Sin Zustand inicialmente. | Query, Auth y estado local cubren necesidades conocidas. | Revaluar solo con evidencia de estado cliente complejo. |
| ADR-009 | Kg como unidad canónica. | Impide reinterpretar historial al cambiar preferencia. | Conversiones obligatorias en límites. |
| ADR-010 | Sin offline. | Restricción del producto. | Error de red explícito; no hay cola silenciosa. |

---

## 13. Contratos de aplicación e integración

### 13.1 Tipos de dominio mínimos

~~~ts
type WeightUnit = "kg" | "lb";
type SetType = "warmup" | "approach" | "working";
type WorkoutStatus = "active" | "completed" | "cancelled";

type CompletedSet = {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  setType: SetType;
  weightKg: number;
  reps: number;
  rir: number | null;
  completedAt: string;
};
~~~

Estos tipos son normativos en significado, no necesariamente en nombre exacto de archivo.

### 13.2 Puertos de repositorio

| Puerto | Operaciones mínimas |
|---|---|
| AuthRepository | signUp, signIn, signOut, resetPassword, getSession, onAuthStateChange |
| ExerciseRepository | list, getById, createCustom, updateCustom, archive, restore |
| RoutineRepository | list, getById, create, update, duplicate, archive, restore, reorder |
| WorkoutRepository | getActive, startFromRoutine, startEmpty, addExercise, removeExercise, reorderExercises, complete, cancel |
| SetRepository | create, update, remove, reorder |
| HistoryRepository | listWorkouts, getWorkoutDetail, getExerciseHistory, getPreviousExerciseSession |
| AnalyticsRepository | getExercisePRs, getExerciseTrend, getWeeklyMuscleSets |

### 13.3 Convención de resultado

Los adaptadores convierten errores externos a un vocabulario estable:

| Código de dominio | Uso |
|---|---|
| UNAUTHENTICATED | Sesión ausente o vencida. |
| FORBIDDEN | Operación no permitida. |
| NOT_FOUND | Recurso no visible o inexistente. |
| VALIDATION_ERROR | Entrada viola contrato. |
| ACTIVE_WORKOUT_EXISTS | Invariante de workout único. |
| CONFLICT | Recurso cambió o duplicado. |
| NETWORK_ERROR | No hubo respuesta confiable. |
| UNKNOWN | Error no clasificado, con correlationId local. |

La UI nunca decide usando textos crudos de Postgres.

### 13.4 Estrategia de caché

| Query key | Contenido | Invalidación |
|---|---|---|
| auth-session | sesión | eventos Auth |
| profile | perfil actual | editar perfil |
| exercises + filtros | catálogo visible | crear, editar, archivar |
| routines | lista | crear, editar, duplicar, archivar |
| routine + id | detalle | mutar elementos |
| active-workout | sesión activa agregada | toda mutación de workout o set |
| workout-history + página | historial | completar, eliminar |
| exercise-history + id | historial del ejercicio | completar o eliminar |
| exercise-prs + id | PR | completar o eliminar |
| weekly-muscle-sets + semana | volumen semanal | completar o eliminar |

La V1 favorece invalidación y refetch frente a actualizaciones optimistas complejas. La confirmación visual solo ocurre tras respuesta remota.

### 13.5 Variables de entorno

| Variable | Visibilidad | Regla |
|---|---|---|
| VITE_SUPABASE_URL | Pública | Permitida en cliente. |
| VITE_SUPABASE_PUBLISHABLE_KEY | Pública | Permitida; el control real es Auth, grants y RLS. |
| SERVICE ROLE o secret key | Secreta | Prohibida en frontend y Cloudflare Pages estático. |
| VITE_APP_VERSION | Pública | Commit o versión para diagnóstico. |

El archivo .env.example contiene nombres sin valores. Ningún .env real se confirma en Git.

---

## 14. Diseño de experiencia de usuario

### 14.1 Principios

1. El entrenamiento activo tiene prioridad visual sobre navegación y analítica.
2. La acción más frecuente recibe el menor número de pasos.
3. Guardado, error y dato sin guardar nunca comparten la misma apariencia.
4. El historial se lee; la plantilla se edita.
5. Los números importantes son grandes, alineados y comparables.
6. Un gesto no es el único medio para realizar una acción.
7. Las confirmaciones se reservan para pérdida de información o efectos irreversibles.

### 14.2 Arquitectura de información

~~~mermaid
flowchart TD
    L["Acceso"] --> H["Inicio"]
    H --> R["Rutinas"]
    H --> W["Workout activo"]
    H --> I["Historial"]
    H --> P["Progreso"]
    H --> E["Ejercicios"]
    H --> S["Ajustes"]
~~~

### 14.3 Rutas

| Ruta | Propósito | Acceso |
|---|---|---|
| /login | Iniciar sesión | Público |
| /register | Crear cuenta | Público |
| /forgot-password | Solicitar recuperación | Público |
| /reset-password | Fijar nueva contraseña | Token válido |
| /app | Resumen y acción de empezar o continuar | Privado |
| /app/routines | Lista de rutinas | Privado |
| /app/routines/new | Crear | Privado |
| /app/routines/:id | Ver o editar | Privado |
| /app/workout/active | Registrar sesión | Privado |
| /app/history | Historial paginado | Privado |
| /app/history/:id | Detalle snapshot | Privado |
| /app/exercises | Catálogo | Privado |
| /app/exercises/:id | Ficha e historial | Privado |
| /app/progress | Resumen analítico | Privado |
| /app/settings | Perfil y cuenta | Privado |

### 14.4 Navegación móvil

La barra inferior contiene Inicio, Rutinas, Entrenar, Historial y Progreso. Ejercicios y Ajustes viven en menú secundario. Durante workout activo, una barra persistente muestra tiempo, progreso y finalizar; la navegación accidental pide confirmación solo si existen entradas no guardadas.

### 14.5 Inventario de pantallas y estados

| Pantalla | Carga | Vacío | Error | Éxito |
|---|---|---|---|---|
| Inicio | esqueletos breves | primera rutina | reintentar | resumen reciente |
| Rutinas | tarjetas esqueleto | crear primera | reintentar | lista |
| Editor rutina | valores iniciales | sin ejercicios | errores por campo | guardada |
| Workout | estructura esqueleto | añadir ejercicio | serie no guardada | serie confirmada |
| Historial | filas esqueleto | primer workout | reintentar | lista paginada |
| Progreso | gráfica esqueleto | registrar datos | reintentar | gráfica y tabla |
| Ejercicios | lista esqueleto | sin resultados | reintentar | lista filtrada |

### 14.6 Componente crítico de serie

Cada fila presenta, en este orden:

1. número y tipo de serie;
2. referencia de la última vez cuando existe;
3. campo de peso con unidad;
4. campo de repeticiones;
5. RIR opcional;
6. confirmación de al menos 44 px;
7. estado guardando, guardada o error.

Al confirmar, no se borra el valor. La siguiente serie puede sugerir la carga anterior, pero el usuario conserva control. No hay autocompletado que confirme sin toque.

### 14.7 Prototipos obligatorios antes de frontend

| ID | Flujo | Variantes |
|---|---|---|
| UX-01 | Registro e inicio de sesión | éxito, error, email pendiente |
| UX-02 | Crear rutina | vacía, selector, validación, reordenar |
| UX-03 | Iniciar workout | rutina válida, inválida, activo existente |
| UX-04 | Registrar serie | primera vez, última vez, guardando, error, PR |
| UX-05 | Finalizar workout | borrador pendiente, resumen, error |
| UX-06 | Historial | vacío, lista, detalle |
| UX-07 | Progreso | sin datos, rango corto, muchos puntos |
| UX-08 | Responsive | 360, 390, 768 y 1280 px |

La Puerta 1 exige prototipos navegables y prueba con cinco tareas. No se escribe frontend de producto antes de aprobarlos.

---

## 15. Seguridad, privacidad y amenazas

### 15.1 Objetivos

- confidencialidad entre usuarios;
- integridad de historial y propiedad;
- disponibilidad razonable con fallos claros;
- mínimo privilegio;
- ninguna confianza en validación del navegador;
- trazabilidad de migraciones y políticas.

### 15.2 Modelo de amenazas

| ID | Amenaza | Control | Prueba |
|---|---|---|---|
| TH-01 | Usuario cambia user_id en solicitud | RLS con auth.uid y with check | PRU-RLS-01 |
| TH-02 | Lectura indirecta por tabla hija | Políticas ownership mediante relaciones | PRU-RLS-02 |
| TH-03 | View ignora RLS | security_invoker o schema no expuesto | PRU-RLS-03 |
| TH-04 | Secret key en bundle | solo publishable key; escaneo CI | PRU-SEC-01 |
| TH-05 | Inyección en texto | API parametrizada; React escapa salida; sin HTML crudo | PRU-SEC-02 |
| TH-06 | Doble envío | UUID cliente, PK y bloqueo UI | PRU-E2E-032 |
| TH-07 | Acceso a ID ajeno por URL | RLS y manejo uniforme de not found | PRU-E2E-SEC |
| TH-08 | Enumeración de correos | mensajes neutros en registro y recuperación | PRU-AUTH-01 |
| TH-09 | Sesión visible tras logout | limpiar Query cache y estado sensible | PRU-AUTH-02 |
| TH-10 | Datos corruptos por operación parcial | RPC transaccionales | PRU-DB-RPC |
| TH-11 | Dependencia vulnerable | auditoría de dependencias y actualizaciones controladas | PRU-CI-01 |
| TH-12 | XSS persistente en notas | render como texto; CSP; no dangerouslySetInnerHTML | PRU-SEC-03 |

### 15.3 Matriz RLS

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | id = uid | id = uid | id = uid antes y después | id = uid |
| muscle_groups | authenticated true | ninguno cliente | ninguno | ninguno |
| exercises sistema | authenticated e is_system | ninguno cliente | ninguno | ninguno |
| exercises propios | user_id = uid | user_id = uid | user_id = uid antes/después | solo si no referenciado; UI archiva |
| exercise_muscles | ejercicio sistema o propio visible | solo para ejercicio propio | solo propio | solo propio |
| routines | user_id = uid | user_id = uid | user_id = uid antes/después | propietario |
| routine_exercises | rutina pertenece a uid | rutina pertenece a uid | rutina pertenece a uid | rutina pertenece a uid |
| workouts | user_id = uid | user_id = uid | user_id = uid antes/después | propietario |
| workout_exercises | workout pertenece a uid | workout pertenece a uid | workout activo y propio | workout activo y propio |
| sets | workout ancestro pertenece a uid | workout activo y propio | workout activo y propio | workout activo y propio |

Las operaciones históricas excepcionales autorizadas, como eliminar un workout completo, deben ejecutarse mediante una función definida, probada y con search_path fijo; no se relajan las políticas generales.

### 15.4 Grants

1. Habilitar RLS en toda tabla del schema expuesto.
2. Revocar privilegios de anon y authenticated.
3. Conceder a authenticated únicamente las operaciones que usa la V1.
4. Escribir políticas separadas por operación.
5. Indexar columnas de ownership usadas por las políticas.
6. Probar permitido y denegado con dos usuarios distintos y rol anon.

### 15.5 Privacidad y retención

- No se recopilan fecha de nacimiento, salud, fotos ni ubicación.
- Notas son opcionales y privadas.
- Cancelled se conserva hasta que el usuario lo elimine; queda oculto de la UI normal.
- Eliminar cuenta debe borrar o anonimizar todos los datos privados mediante flujo controlado.
- Los logs no contienen tokens, contraseñas, payload completo de notas ni emails completos.
- No se añaden analíticas de terceros en V1 sin una nueva decisión de privacidad.

### 15.6 Checklist ASVS adaptado

- autenticación y recuperación verificadas;
- autorización server-side y por fila;
- validación sintáctica cliente y semántica servidor;
- protección XSS por render seguro;
- configuración sin secretos;
- mensajes de error sin detalles internos;
- dependencias revisadas;
- TLS provisto por hosting;
- eliminación y sesión verificadas;
- pruebas negativas automatizadas.

---

## 16. Estrategia de pruebas

### 16.1 Pirámide

| Nivel | Herramienta | Objeto |
|---|---|---|
| Estática | TypeScript, ESLint | tipos, imports, patrones inseguros |
| Unitaria | Vitest | métricas, unidades, validadores, reducers |
| Componente | React Testing Library | formularios, estados y accesibilidad |
| Integración frontend | Vitest más repositorio simulado | hooks y casos de uso |
| Base de datos | pgTAP y Supabase CLI | constraints, RLS, vistas y RPC |
| End-to-end | Playwright | flujos críticos contra ambiente de prueba |
| No funcional | Lighthouse, axe, pruebas manuales | rendimiento, responsive, accesibilidad |

### 16.2 Casos unitarios de métricas

| ID | Entrada | Resultado |
|---|---|---|
| PRU-MET-01 | 80 kg × 12 working completed | e1RM 112 kg |
| PRU-MET-02 | 85 kg × 10 | e1RM 113.333 kg antes de presentación |
| PRU-MET-03 | 100 kg × 16 | e1RM no elegible |
| PRU-MET-04 | 0 kg × 12 | e1RM no elegible |
| PRU-MET-05 | 80 kg × 12 warmup | excluido de PR y volumen |
| PRU-MET-06 | 80 kg × 12 workout active | provisional, no definitivo |
| PRU-MET-07 | 80 kg × 12 y luego 80 kg × 13 | nuevo PR reps por peso |
| PRU-MET-08 | mejor estimado igual dentro de 0.01 | no crea PR nuevo |
| PRU-MET-09 | 3 working pecho, 2 approach pecho | series semanales igual a 3 |
| PRU-MET-10 | cambio kg a lb y regreso | magnitud canónica sin deriva mayor a tolerancia |

### 16.3 Casos de constraints

| ID | Condición | Resultado |
|---|---|---|
| PRU-DB-01 | dos workouts activos del mismo usuario | segundo insert rechazado |
| PRU-DB-02 | finished_at anterior a started_at | rechazado |
| PRU-DB-03 | dos set_number iguales en un ejercicio | rechazado |
| PRU-DB-04 | RIR 11 | rechazado |
| PRU-DB-05 | rep_min 12 y rep_max 8 | rechazado |
| PRU-DB-06 | workout completed sin serie | complete_workout rechaza |
| PRU-DB-07 | start_from_routine falla al copiar | rollback total |
| PRU-DB-08 | rutina se edita tras workout | snapshot histórico sin cambios |

### 16.4 Casos RLS mínimos por tabla privada

Para cada operación:

1. usuario A accede a su fila: permitido si el negocio lo permite;
2. usuario B intenta misma fila: cero filas o denegado;
3. anon intenta: denegado;
4. usuario A intenta escribir user_id de B: denegado;
5. usuario A intenta acceder por tabla hija de B: denegado.

### 16.5 Suite end-to-end crítica

| ID | Flujo |
|---|---|
| PRU-E2E-001 | registrar, confirmar, iniciar y cerrar sesión |
| PRU-E2E-020 | crear rutina completa, reordenar y duplicar |
| PRU-E2E-030 | iniciar rutina y rechazar segundo workout activo |
| PRU-E2E-031 | registrar series, recargar y recuperar datos |
| PRU-E2E-032 | simular doble toque y comprobar una sola fila |
| PRU-E2E-033 | simular fallo de red y comprobar que no se finge guardado |
| PRU-E2E-035 | finalizar y visualizar resumen |
| PRU-E2E-040 | editar rutina y comprobar snapshot histórico |
| PRU-E2E-042 | producir cada tipo de PR |
| PRU-E2E-044 | validar límite semanal America/La_Paz |
| PRU-E2E-SEC | usuario B no ve recursos de A por URL o solicitud |

### 16.6 Datos de prueba

- Usuario A y Usuario B con IDs fijos en fixtures.
- Rutina Push A con cinco ejercicios.
- Workouts justo antes y después de medianoche y límite semanal.
- Series en kg y entradas mostradas en lb.
- Ejercicio sin historial, con historial y archivado.
- Red lenta, respuesta 401, 403, 409 y error genérico.

### 16.7 Severidad de defectos

| Nivel | Definición | Regla de liberación |
|---|---|---|
| Crítica | fuga de datos, pérdida de historial, app inutilizable | bloquea inmediatamente |
| Alta | flujo Must no funciona o cálculo incorrecto | bloquea V1 |
| Media | workaround razonable; afecta Should o UX | planificada antes o después según PO |
| Baja | cosmético sin impedir tarea | puede quedar documentada |

---

## 17. Calidad del código y configuración

### 17.1 Convenciones

- TypeScript strict, sin any implícito.
- Componentes y tipos en PascalCase; funciones y variables en camelCase.
- Archivos de componente en PascalCase; utilidades en kebab-case o convención única elegida por lint.
- Funciones de dominio pequeñas, puras y con nombres explícitos.
- No duplicar reglas entre formulario, dominio y SQL: cada capa valida su responsabilidad.
- No importar desde rutas internas de otra feature; usar API pública de módulo.
- No dejar console.log en producción.
- Fechas se transportan como ISO 8601 y se formatean en borde de UI.
- Dinero no existe en V1; peso nunca usa float sin normalización de tolerancia.

### 17.2 Definición de listo

Una historia entra a sprint solo si:

- tiene objetivo y actor;
- criterios de aceptación observables;
- diseño aprobado si cambia UI;
- reglas y errores conocidos;
- dependencias disponibles;
- datos y contratos identificados;
- pruebas previstas;
- tamaño máximo 8 puntos o se divide.

### 17.3 Definición de terminado

- criterios de aceptación pasan;
- lint y tipos pasan;
- pruebas nuevas y existentes pasan;
- RLS y constraints probados cuando aplica;
- responsive y teclado revisados;
- estados carga, vacío y error implementados;
- no hay secretos ni logs sensibles;
- documentación y trazabilidad actualizadas;
- pull request revisado;
- desplegado en preview y aceptado por el propietario;
- cero defectos críticos o altos.

### 17.4 Estrategia Git

| Elemento | Regla |
|---|---|
| Rama principal | main siempre desplegable |
| Trabajo | ramas cortas feat/HU-032-registro-series o fix/… |
| Commits | convencionales: feat, fix, test, refactor, docs, chore |
| Pull request | una intención coherente, evidencia de pruebas y enlace a HU |
| Merge | squash para historia completa; no force push a main |
| Releases | tags v0.x durante desarrollo; v1.0.0 al aprobar producción |

### 17.5 Pipeline de integración continua

1. instalación reproducible con lockfile;
2. comprobación de formato;
3. lint;
4. TypeScript;
5. unitarias y componentes;
6. build de producción;
7. pruebas de migración y RLS cuando el entorno lo permita;
8. Playwright sobre preview o ambiente de integración;
9. Lighthouse y axe en puerta de release.

---

## 18. Planeación y estimación

### 18.1 Supuestos

- equipo inicial: un desarrollador con apoyo de Codex;
- sprints de una semana;
- capacidad inicial orientativa: 12 a 18 puntos por sprint;
- no se compromete fecha final hasta medir dos sprints;
- el tiempo de aprendizaje, revisión y corrección cuenta;
- cada sprint reserva aproximadamente 20 % para pruebas, documentación y deuda.

### 18.2 Estimación por fase

| Fase | Sprints | Crédito de historias | Resultado |
|---|---:|---|---|
| Línea base | 0 | ninguno | requisitos aprobados |
| UX/UI | 1 a 2 | ninguno; reduce incertidumbre | prototipo y sistema visual |
| Frontend simulado | 3 a 6 | avance técnico, no historia aceptada | flujo completo sin Supabase |
| Backend | 7 a 9 | avance técnico, no historia aceptada | esquema, Auth, RLS, RPC y repositorios |
| Integración | 10 a 11 | aquí se aceptan las HU integradas | datos reales y analítica |
| Refactor y release | 12 a 13 | cierre de calidad | V1 desplegada |

La suma del backlog es 116 puntos. Como se eligió trabajar por capas, una historia atraviesa varios sprints y sus puntos se contabilizan una sola vez, al quedar integrada y aceptada. Las tareas de diseño y arquitectura se controlan aparte.

### 18.3 Recursos

| Recurso | Uso |
|---|---|
| VS Code y Codex | implementación asistida y revisión |
| GitHub | código, issues, PR y CI |
| Supabase local o proyecto de desarrollo | migraciones y pruebas |
| Supabase alojado | producción |
| Cloudflare Pages | previews y producción |
| Navegadores y teléfono real | aceptación responsive |

---

## 19. Plan completo de sprints

### SPR-00 Línea base y preparación

**Objetivo:** aprobar qué se construirá antes de tocar código de producto.

**Trabajo**

- revisar este documento;
- resolver decisiones de sección 26;
- congelar V1, reglas, stack y fórmulas;
- crear tablero de historias y matriz de trazabilidad;
- establecer repositorio, README y ADR iniciales después de aprobación.

**Entregables:** especificación v1.0 aprobada, backlog ordenado, riesgos iniciales y Puerta 0 firmada.

**Salida CP-00:** cero PENDIENTE bloqueante; todas las historias Must tienen CA y prueba prevista; Tayron autoriza explícitamente comenzar.

### SPR-01 Arquitectura de información y wireframes

**Objetivo:** validar flujos y jerarquía antes del aspecto visual.

**Trabajo:** UX-01 a UX-08 en baja fidelidad; mapa de rutas; estados; prueba de cinco tareas; revisión de fricción de serie.

**No incluye:** React, Supabase ni diseño final.

**Salida CP-01A:** cada tarea crítica puede completarse en prototipo; no hay callejones sin salida; cambios registrados.

### SPR-02 Diseño visual y componentes

**Objetivo:** cerrar UI antes de desarrollar frontend.

**Trabajo:** tokens de color, tipografía, espacios, componentes, variantes, tema, formularios, tabla o tarjeta de serie, gráficas, responsive y prototipo de alta fidelidad.

**Salida CP-01B:** pantallas en 360/390/768/1280; contraste AA; estados completos; Tayron aprueba prototipo.

### SPR-03 Shell frontend y autenticación simulada

**Objetivo:** construir navegación, layout y disciplina técnica sin backend.

**Historias:** HU-001, HU-002, HU-003, HU-004 con repositorio mock.

**Trabajo técnico:** Vite, TypeScript strict, Tailwind, shadcn, Router, providers, error boundary, lint, Vitest, RTL, CI base.

**Salida CP-02A:** rutas y protección simulada; pruebas de componentes; build limpio; sin Supabase importado en UI.

### SPR-04 Frontend de ejercicios y rutinas

**Objetivo:** completar gestión de plantillas con datos simulados.

**Historias:** HU-010, HU-011, HU-012, HU-020, HU-021, HU-022.

**Trabajo:** buscador, filtros, editor, selector, reordenamiento accesible, validaciones, archivo y duplicación.

**Salida CP-02B:** flujo completo en mock; refresh simulado consistente; responsive y teclado aprobados.

### SPR-05 Frontend del workout activo

**Objetivo:** validar la experiencia central antes de persistencia real.

**Historias:** HU-030 a HU-035.

**Trabajo:** snapshot mock, navegación entre ejercicios, filas de serie, última vez, timer, errores simulados, finalizar y resumen.

**Salida CP-02C:** usuario completa una sesión de cinco ejercicios; serie en ≤ 8 s; estados de red visibles; doble toque simulado.

### SPR-06 Frontend de historial y progreso

**Objetivo:** cerrar todo el frontend V1 con contratos simulados.

**Historias:** HU-040 a HU-045, HU-050 y HU-051.

**Trabajo:** paginación, detalle snapshot, PR, gráfica diferida, series semanales, accesibilidad integral.

**Salida CP-02D:** demo extremo a extremo con mock; ningún cambio de UI bloqueante pendiente antes del backend.

### SPR-07 Base de datos y Auth

**Objetivo:** construir una base segura y reproducible.

**Historias de soporte:** HU-001 a HU-004, infraestructura de E2 a E5.

**Trabajo:** Supabase CLI, enums, tablas, checks, FKs, índices, triggers, seed, perfil automático, Auth, migraciones limpias y types generados.

**Salida CP-03A:** reset desde cero exitoso; migraciones reproducibles; constraints PRU-DB pasan.

### SPR-08 RLS, catálogo y rutinas

**Objetivo:** implementar propiedad y repositorios de las primeras entidades.

**Historias:** HU-010 a HU-022 con datos reales.

**Trabajo:** grants mínimos, políticas por operación, pruebas A/B/anon, repositorios Supabase, función duplicate_routine.

**Salida CP-03B:** suite RLS completa para tablas abordadas; UI funciona sustituyendo solo el adaptador mock.

### SPR-09 Backend de workout y transacciones

**Objetivo:** garantizar atomicidad e integridad del núcleo.

**Historias:** HU-030 a HU-035.

**Trabajo:** políticas de workout, RPC start, complete y cancel; CRUD de sets; concurrencia; idempotencia; snapshot.

**Salida CP-03C:** pruebas de rollback, activo único, ownership de hijos y recuperación pasan.

### SPR-10 Integración de entrenamiento

**Objetivo:** conectar el frontend central con Supabase.

**Historias:** HU-030 a HU-035 y HU-050.

**Trabajo:** adaptadores reales, Query keys, invalidación, sesión, conversiones, errores de dominio y E2E.

**Salida CP-04A:** workout real completo desde login hasta resumen; recarga; red fallida; dos usuarios aislados.

### SPR-11 Integración de historial y analítica

**Objetivo:** obtener progreso exacto desde hechos reales.

**Historias:** HU-040 a HU-045.

**Trabajo:** views seguras, consultas, funciones puras, última vez, PR, e1RM, semanas y eliminación con recálculo.

**Salida CP-04B:** PRU-MET, E2E analítico y RLS de views pasan; gráfico y tabla concuerdan.

### SPR-12 Refactorización y endurecimiento

**Objetivo:** reducir deuda sin cambiar comportamiento.

**Trabajo:** eliminar duplicación, revisar límites de módulos, perfilar queries, accesibilidad, dependencias, bundles, CSP y manejo global.

**Salida CP-05A:** suite en verde, cero defectos críticos/altos, budgets de rendimiento satisfechos o desviación aprobada.

### SPR-13 Despliegue y aceptación V1

**Objetivo:** liberar una versión operable y recuperable.

**Trabajo:** ambiente producción, URLs Auth, variables, Cloudflare SPA fallback, migración, seed de catálogo, smoke tests, respaldo, manual y aceptación.

**Salida CP-05B:** checklist de release completo, tag v1.0.0, producción probada desde teléfono real y aprobación de Tayron.

### 19.1 Regla de ejecución para Codex

Codex recibe un sprint a la vez. No se le pide “construir toda la app”. Cada encargo incluye:

1. objetivo y alcance del sprint;
2. historias, RN y RNF aplicables;
3. archivos permitidos o capa permitida;
4. pruebas obligatorias;
5. restricciones y no objetivos;
6. evidencia de salida;
7. orden de inspeccionar, planear, implementar, probar y resumir.

No se inicia el sprint siguiente hasta aceptar el actual.

---

## 20. Puertas de calidad

| Puerta | Momento | Criterio de aprobación |
|---|---|---|
| CP-00 | antes de cualquier código | alcance, decisiones, historias, datos y arquitectura aprobados |
| CP-01 | tras UX/UI | prototipos y responsive aprobados |
| CP-02 | tras frontend mock | flujo V1 completo con contratos simulados |
| CP-03 | tras backend | migraciones, constraints, RLS y RPC pasan aislados |
| CP-04 | tras integración | flujos E2E, seguridad y analítica pasan |
| CP-05 | antes de release | calidad, rendimiento, accesibilidad, respaldo y manual pasan |

### 20.1 Evidencia aceptable

- enlace o captura de prototipo;
- salida de prueba automatizada;
- reporte de Lighthouse o axe;
- script reproducible;
- migración versionada;
- consulta que demuestra aislamiento A/B;
- video corto del flujo;
- checklist firmado con fecha.

Una afirmación verbal del agente sin evidencia no cierra una puerta.

---

## 21. Gestión de riesgos

Escala: probabilidad e impacto de 1 a 5; exposición = producto.

| ID | Riesgo | P | I | Exp. | Prevención | Contingencia |
|---|---|---:|---:|---:|---|---|
| RSK-01 | Alcance crece hacia nutrición o IA | 4 | 4 | 16 | congelar V1 y change control | mover a FUTURO |
| RSK-02 | RLS permite acceso cruzado | 2 | 5 | 10 | matriz y pgTAP A/B/anon | bloquear release y corregir |
| RSK-03 | Operación parcial rompe snapshot | 3 | 5 | 15 | RPC transaccional | rollback y script de reparación |
| RSK-04 | UI rápida en mock pero lenta real | 3 | 3 | 9 | contratos, paginación, índices | perfilar y optimizar query |
| RSK-05 | Plan gratuito cambia o alcanza límite | 2 | 4 | 8 | métricas de uso, datos portables | evaluar migración o pago aprobado |
| RSK-06 | Proyecto Supabase inactivo se pausa | 2 | 3 | 6 | uso regular y runbook | reactivar y comunicar |
| RSK-07 | Pérdida de datos por migración | 2 | 5 | 10 | backup y staging/local | restaurar backup |
| RSK-08 | Codex modifica fuera del sprint | 3 | 4 | 12 | prompts con alcance y revisión diff | revertir solo cambio identificado |
| RSK-09 | Métricas fitness engañosas | 3 | 3 | 9 | definiciones explícitas | etiquetar y ajustar versión futura |
| RSK-10 | Conexión falla en gimnasio | 3 | 4 | 12 | error y reintento honestos | conservar inputs en memoria durante vista |
| RSK-11 | Recharts aumenta bundle | 3 | 2 | 6 | lazy loading | cambiar librería o gráfica simple |
| RSK-12 | Dependencia abandonada | 2 | 3 | 6 | pocas dependencias y revisión | reemplazar detrás de adaptador |
| RSK-13 | Diseño no cabe en móvil pequeño | 3 | 4 | 12 | prototipo 360 px y teléfono real | volver a CP-01 |
| RSK-14 | Dos pestañas editan workout | 2 | 3 | 6 | updated_at, invalidación y conflicto | recargar agregado más reciente |

Riesgos con exposición ≥ 12 se revisan en cada sprint. Los demás, al menos en cada puerta.

---

## 22. Despliegue, operación y soporte

### 22.1 Ambientes

| Ambiente | Datos | Propósito |
|---|---|---|
| Local | ficticios | migraciones, RLS y desarrollo |
| Preview | ficticios de prueba | PR y aceptación visual |
| Producción | reales privados | uso normal |

No se copian datos reales a local o preview.

### 22.2 Despliegue

1. merge aprobado a main;
2. CI en verde;
3. aplicar migraciones compatibles;
4. build Vite;
5. publicar en Cloudflare Pages;
6. ejecutar smoke tests;
7. vigilar errores;
8. marcar release.

Los cambios destructivos siguen expandir-migrar-contraer: primero añadir compatibilidad, luego migrar datos, luego retirar en otra release.

### 22.3 Configuración Cloudflare

- comando de build documentado;
- directorio dist;
- fallback SPA a index.html;
- variables públicas configuradas por ambiente;
- headers de seguridad compatibles con Supabase;
- preview por pull request;
- dominio pages.dev gratuito mientras no se compre uno.

### 22.4 Respaldo y recuperación

- antes de una migración destructiva: exportar y comprobar tamaño;
- restauración se ensaya antes de V1 o se documenta limitación del plan;
- migraciones jamás se editan después de aplicarse; se crea una nueva;
- objetivo inicial RPO: último backup verificable;
- objetivo inicial RTO: mejor esfuerzo dentro de 24 h, sin prometer SLA comercial.

### 22.5 Soporte

| Evento | Respuesta |
|---|---|
| App no carga | comprobar Pages, bundle y variables |
| Login falla | estado Supabase Auth, URL redirect y sesión |
| Datos faltan | no crear manualmente; revisar RLS, usuario y queries |
| Analítica incorrecta | reproducir con fixture y función pura |
| Migración falla | detener despliegue; no improvisar cambios en producción |
| Fuga sospechada | deshabilitar acceso si es necesario, conservar evidencia y rotar secretos |

---

## 23. Métricas del proyecto y del producto

### 23.1 Proyecto

| Métrica | Interpretación |
|---|---|
| Velocidad | planificación, no productividad individual |
| Lead time por HU | tiempo de lista a aceptada |
| Defectos por severidad | calidad del incremento |
| Reaperturas | claridad de CA y revisión |
| Cobertura de flujos Must | riesgo de release |
| Deuda registrada | trabajo conocido no oculto |

### 23.2 Producto

| Métrica | Fórmula o señal |
|---|---|
| Workout completion rate | completed / iniciados, excluyendo pruebas |
| Tiempo de registro de set | confirmación menos primer foco |
| Error de guardado | mutaciones fallidas / intentos |
| Recuperación exitosa | activos reconstruidos tras reload |
| Uso de rutina | workouts desde rutina / total |
| Consulta de progreso | sesiones que visitan progreso, solo si se aprueba analítica privada |

La V1 no envía telemetría de producto a terceros. Las métricas de uso requieren una decisión posterior de privacidad. Las métricas técnicas pueden recogerse con herramientas del hosting sin payload privado.

---

## 24. Matriz de trazabilidad

| Requisitos | Historias | Pruebas | Sprint |
|---|---|---|---|
| RF-001 a RF-005 | HU-001 a HU-004 | PRU-AUTH-01/02, E2E-001 | 3, 7, 10 |
| RF-010 a RF-014 | HU-010 a HU-012 | componente, RLS, E2E selectivo | 4, 8 |
| RF-020 a RF-024 | HU-020 a HU-022 | PRU-DB-05/08, E2E-020 | 4, 8 |
| RF-030 a RF-041 | HU-030 a HU-035, HU-050 | PRU-DB-01/06/07, E2E-030 a 035 | 5, 9, 10 |
| RF-050 a RF-058 | HU-040 a HU-045 | PRU-MET-01 a 10, E2E-040/042/044 | 6, 11 |
| RF-060 a RF-062 | HU-050, HU-051 | componente, axe, navegación E2E | 3 a 13 |
| RNF-001 a RNF-004 | HU-032, HU-051 | test usabilidad, responsive, axe | 1, 2, 5, 12 |
| RNF-005 a RNF-007 | HU-050 | Lighthouse, fallo de red | 6, 10, 12 |
| RNF-008 a RNF-011 | todas privadas | suite RLS y constraints | 7 a 11 |
| RNF-012 a RNF-017 | transversal | CI, revisión, restore | 3 a 13 |
| RNF-018 | transversal | revisión de dependencias y planes | 0, 13 |

La matriz se amplía a nivel individual cuando los issues se creen. Ningún RF puede quedar sin HU y PRU.

---

## 25. Control de cambios

### 25.1 Solicitud

Todo cambio incluye:

- ID y fecha;
- solicitante;
- motivo y beneficio;
- requisitos, datos, UI, seguridad y sprints afectados;
- esfuerzo y riesgo;
- decisión: aprobar, rechazar o posponer;
- versión de este documento.

### 25.2 Clasificación

| Tipo | Ejemplo | Tratamiento |
|---|---|---|
| Corrección | typo sin cambiar significado | patch del documento |
| Aclaración | nuevo CA coherente | revisión técnica |
| Cambio de alcance | editar workouts históricos | análisis y aprobación PO |
| Cambio arquitectónico | backend Node | ADR nuevo y replanificación |
| Emergencia | fuga de datos | hotfix y retrospectiva |

### 25.3 Registro inicial

| Cambio | Estado |
|---|---|
| CR-000 Crear esta línea base integral | Aprobado el 2026-09-12 |
| CR-001 Excluir eliminación de cuenta y datos de V1; actualizar RF-006 y su trazabilidad | Aprobado por Tayron el 2026-09-12 |
| CR-002 Aclaraciones de SPR-04: conservar este archivo como fuente normativa, extender el sistema visual aprobado a ejercicios y operaciones faltantes, persistir datos mock solo en `sessionStorage`, usar sufijos únicos al duplicar rutinas, habilitar lint real de TypeScript y no iniciar workouts antes de SPR-05 | Aprobado por Tayron el 2026-09-12 |
| CR-003 Decisión de SPR-05: dejar fuera el inicio de workout vacío de la interfaz y del adaptador mock; RF-031 permanece diferido por ser prioridad Should | Aprobado por Tayron el 2026-09-12 |

---

## 26. Puerta 0 y decisiones finales

### 26.1 Decisiones aprobadas en la versión 1.0

1. Nombre provisional Gym Tracker.
2. Interfaz inicial en español.
3. Semana lunes a domingo y America/La_Paz por defecto.
4. Kg canónico y kg como presentación predeterminada.
5. Multiusuario privado, sin panel administrador.
6. Registro por correo y contraseña con confirmación.
7. Workout histórico no editable salvo nota; puede eliminarse con confirmación.
8. Cancelled queda oculto y excluido hasta eliminación.
9. Peso corporal usa carga añadida; cardio no entra.
10. Beat Last Time es comparación por serie ordinal, no puntuación global.
11. Pruebas con Vitest, RTL, Playwright y pgTAP.
12. Sprints de una semana y secuencia UX → frontend mock → backend → integración → refactor.

### 26.2 Resultado de la revisión

- [x] Tayron aprueba el problema, visión y alcance V1.
- [x] Tayron aprueba explícitamente los elementos FUERA V1.
- [x] Tayron aprueba todas las reglas de negocio de la sección 6.
- [x] Tayron aprueba RF y RNF dentro del alcance V1; RF-006 queda FUERA V1.
- [x] Tayron aprueba las historias y sus criterios.
- [x] Tayron aprueba el modelo de nueve tablas más auth.users.
- [x] Tayron aprueba snapshots, kg canónico y estadísticas derivadas.
- [x] Tayron aprueba arquitectura, RLS, RPC y ausencia de backend propio.
- [x] Tayron aprueba UX, rutas y estados.
- [x] Tayron aprueba estrategia de pruebas y puertas.
- [x] Tayron aprueba los 14 sprints SPR-00 a SPR-13.
- [x] Tayron aprueba riesgos y alcance operativo.
- [x] Tayron autoriza convertir el documento a la línea base 1.0.
- [x] SPR-02 terminado y CP-01B cerrada el 2026-09-12.
- [x] Inicio de SPR-03 autorizado por Tayron el 2026-09-12.
- [x] SPR-03 terminado y CP-02A cerrada el 2026-09-12; la aplicación fue probada desde un celular en la misma red Wi‑Fi usando la URL de red de Vite.
- [x] Inicio de SPR-04 y aclaraciones CR-002 autorizados por Tayron el 2026-09-12.
- [x] SPR-04 terminado y CP-02B cerrado por aprobación de Tayron el 2026-09-12, con evidencia automatizada de flujo mock, persistencia de sesión, responsive y teclado.
- [x] Inicio de SPR-05 autorizado por Tayron el 2026-09-12.
- [x] SPR-05 terminado y CP-02C cerrado por aprobación de Tayron el 2026-09-12, con evidencia automatizada del flujo de cinco ejercicios, errores/reintentos, doble toque, teclado y resumen provisional.
- [x] Inicio de SPR-06 autorizado por Tayron el 2026-09-12.
- [x] SPR-06 terminado y CP-02D cerrada por aprobación de Tayron el 2026-09-13, con evidencia automatizada de historial, detalle histórico, notas, eliminación mock, progreso, responsive y captura reproducible.

**Registro de aceptación:** el 12 de septiembre de 2026, Tayron indicó que leyó el documento, consideró excelente la propuesta y solicitó crear la versión 1.0. Esta aprobación cierra CP-00. Posteriormente autorizó SPR-03, con eliminación de cuenta fuera de V1 y autenticación simulada limitada a una marca en `sessionStorage`. Tras probar el acceso desde un celular conectado a la misma red Wi‑Fi, Tayron aprobó el incremento y cerró CP-02A. En la misma fecha aprobó el incremento completo de SPR-04 y cerró CP-02B; esa aprobación no autorizaba iniciar SPR-05 en ese momento. Posteriormente autorizó explícitamente iniciar SPR-05 y aprobó el incremento completo, cerrando CP-02C. Finalmente autorizó SPR-06 y aprobó el incremento completo con su evidencia responsive reproducible, cerrando CP-02D el 13 de septiembre de 2026.

---

## 27. Plantilla de encargo para Codex

~~~text
Trabaja únicamente en [SPR-ID y nombre] del archivo docs/gym-tracker-engineering-spec-v1.0.md.

Objetivo:
[copiar objetivo]

Alcance:
[historias, RN, RF y RNF]

No objetivos:
[lo excluido en este sprint]

Antes de editar:
1. Lee AGENTS.md, engineering-spec.md y archivos relacionados.
2. Inspecciona el estado actual y cambios no relacionados.
3. Propón un plan breve y señala cualquier contradicción.
4. No avances si la Puerta anterior no tiene evidencia.

Implementación:
- respeta las capas y ADR;
- no añadas dependencias sin justificar;
- no cambies esquema fuera de migraciones;
- no expongas secretos;
- conserva trabajo ajeno.

Verificación obligatoria:
[pruebas de la puerta]

Entrega:
- resultado;
- archivos cambiados;
- pruebas ejecutadas y resultado;
- decisiones o desviaciones;
- evidencia de la puerta;
- pendientes reales.
~~~

### 27.1 Regla anti-desviación

Si Codex descubre una contradicción o mejora que cambia alcance, detiene esa parte y propone un CR. Puede corregir defectos locales dentro de la historia, pero no ampliar V1 por iniciativa propia.

---

## 28. Criterios de aceptación de la V1 completa

La V1 se acepta solo si:

1. todos los Must están aceptados;
2. todos los RF tienen evidencia;
3. suites estática, unitaria, componente, DB y E2E están en verde;
4. matriz RLS A/B/anon pasa en toda tabla y view expuesta;
5. snapshots sobreviven edición y archivo;
6. cálculos coinciden con fixtures;
7. recarga y error de red no pierden ni inventan series confirmadas;
8. responsive, teclado y contraste pasan;
9. no hay defectos críticos o altos;
10. backup y runbook existen;
11. producción pasa smoke test desde teléfono;
12. Tayron firma aceptación de release.

---

## 29. Evolución posterior

### V2 candidata

- notas por ejercicio y entrenamiento más avanzadas;
- objetivos configurables de volumen;
- comparaciones avanzadas;
- exportación CSV/JSON;
- soporte completo de peso corporal asistido;
- edición histórica auditada;
- selección de fórmula e1RM;
- PWA instalable sin prometer offline.

### Futuro no comprometido

- peso corporal, medidas y fotos;
- programación avanzada;
- recomendaciones;
- inteligencia artificial;
- wearables;
- entrenadores y clientes;
- social;
- nutrición.

Cada elemento debe pasar por comunicación, viabilidad, riesgo, requisitos y nueva línea base.

---

## 30. Referencias

1. Roger S. Pressman y Bruce R. Maxim. Software Engineering: A Practitioner's Approach, novena edición. McGraw Hill. Estructura utilizada: proceso, modelado, calidad y seguridad, gestión de proyectos y mejora.
2. Supabase Documentation. Row Level Security. Reglas de grants, políticas por operación, auth.uid, pruebas e índices.
3. OWASP Foundation. Application Security Verification Standard. Base de controles verificables de seguridad web.
4. Cloudflare Developers. Pages platform limits. Restricciones de build, archivos y despliegue del plan gratuito.
5. W3C. Web Content Accessibility Guidelines 2.2, nivel AA.

Enlaces de referencia:

- https://www.mheducation.com/highered/product/Software-Engineering-A-Practitioners-Approach-Pressman
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://owasp.org/projects/asvs
- https://developers.cloudflare.com/pages/platform/limits/
- https://www.w3.org/TR/WCAG22/

---

## 31. Historial de versiones

| Versión | Fecha | Estado | Cambio |
|---|---|---|---|
| 0.9 | 2026-09-12 | Candidata | Primera especificación integral, backlog, arquitectura, datos, pruebas y sprints. |
| 1.0 | 2026-09-12 | Aprobada | Línea base validada por Tayron; SPR-02 y SPR-03 terminados, RF-006 fuera de V1 y CP-02A cerrada tras validación en celular. |
