import { Check, ChevronLeft, ChevronRight, CirclePlus, Clock3, GripVertical, Minus, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useExercises } from "../../application/exercises/exercise-queries";
import { useRoutines } from "../../application/routines/routine-queries";
import { RepositoryError } from "../../application/shared/repository-error";
import { useActiveWorkout, usePreviousExerciseSession, useSetMutations, useWorkoutMutations } from "../../application/workouts/workout-queries";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { calculateSessionBestE1rm, calculateWorkoutSummary } from "../../domain/metrics/workout-metrics";
import type { CompletedSet, SetInput, SetType, Workout, WorkoutExercise } from "../../domain/types/workout";
import { setInputSchema } from "../../domain/validation/workout-validation";

type Draft = {
  setType: SetType;
  weight: string;
  reps: string;
  rir: string;
};

const createClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "short" }).format(new Date(value));

const formatKg = (value: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 1 }).format(value);

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

const formatRest = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

const setTypeLabels: Record<SetType, string> = {
  warmup: "Calentamiento",
  approach: "Aproximación",
  working: "Trabajo",
};

const draftFromSet = (set: CompletedSet): Draft => ({
  setType: set.setType,
  weight: String(set.weightKg),
  reps: String(set.reps),
  rir: set.rir === null ? "" : String(set.rir),
});

const emptyDraft = (setType: SetType = "working"): Draft => ({ setType, weight: "", reps: "", rir: "" });

const messageFor = (error: unknown, fallback: string) => {
  if (!(error instanceof RepositoryError)) return fallback;
  if (error.code === "NETWORK_ERROR") return fallback;
  if (error.code === "ACTIVE_WORKOUT_EXISTS") return "Ya tienes un workout activo. Puedes continuarlo desde aquí.";
  return error.message;
};

function WorkoutSetup({ onStart, status }: { onStart(routineId: string): void; status?: string | null }) {
  const routines = useRoutines(false);

  return (
    <main className="page-content page-narrow">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Entrenamiento activo</p>
          <h1>Elige una rutina.</h1>
          <p>Carga una estructura y empieza a registrar lo que ocurre, serie por serie.</p>
        </div>
      </header>
      {status && <StatusBanner variant="error">{status}</StatusBanner>}
      {routines.isPending && <Card aria-busy="true"><p className="muted">Cargando rutinas…</p></Card>}
      {routines.isError && <StatusBanner variant="error">No pudimos cargar tus rutinas. <Button variant="quiet" onClick={() => void routines.refetch()}>Reintentar</Button></StatusBanner>}
      {routines.data?.length === 0 && (
        <Card className="empty-state-card">
          <p className="eyebrow">Sin rutinas disponibles</p>
          <h2>Prepara una estructura antes de entrenar.</h2>
          <p className="muted">Una rutina puede guardarse como borrador, pero necesita ejercicios para iniciar un workout.</p>
          <Link className="button button-primary button-link" to="/app/routines/new">Crear rutina</Link>
        </Card>
      )}
      <section className="routine-cards" aria-label="Rutinas para comenzar">
        {routines.data?.map((routine) => (
          <Card className="routine-card" key={routine.id}>
            <div className="routine-card-main">
              <span className={`tag ${routine.items.length ? "tag-teal" : ""}`}>{routine.items.length ? "Lista" : "Borrador"}</span>
              <h2>{routine.name}</h2>
              <p>{routine.description || "Sin descripción"}</p>
              <div className="routine-stats"><span>{routine.items.length} ejercicios</span><span>{routine.items.reduce((total, item) => total + item.targetSets, 0)} series objetivo</span></div>
            </div>
            <Button disabled={!routine.items.length} onClick={() => onStart(routine.id)}>
              <CirclePlus size={16} aria-hidden="true" /> Empezar
            </Button>
          </Card>
        ))}
      </section>
    </main>
  );
}

function WorkoutSummary({ workout, onBack }: { workout: Workout; onBack(): void }) {
  const summary = calculateWorkoutSummary(workout);
  const bestE1rm = calculateSessionBestE1rm(workout.sets);

  return (
    <main className="page-content page-narrow">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Workout completado</p>
          <h1>Sesión guardada.</h1>
          <p>{workout.routineNameSnapshot ?? "Sesión libre"} queda como una fotografía de lo que ocurrió hoy.</p>
        </div>
        <Button variant="quiet" onClick={onBack}>Volver a inicio</Button>
      </header>
      <Card className="summary-card hero-card">
        <div className="between">
          <div><p className="card-kicker">Registro confirmado</p><h2>Buen trabajo.</h2></div>
          <span className="tag tag-teal">COMPLETED</span>
        </div>
        <div className="metric-grid workout-metric-grid">
          <div className="metric"><div className="metric-label">Duración</div><div className="metric-value">{formatDuration(summary.durationSeconds)}</div></div>
          <div className="metric"><div className="metric-label">Series</div><div className="metric-value">{summary.completedSets}</div></div>
          <div className="metric"><div className="metric-label">Volumen</div><div className="metric-value">{formatKg(summary.volumeKg)} kg</div></div>
        </div>
      </Card>
      <section className="summary-pr" aria-label="PR provisional">
        <div><p className="card-kicker">Marca de esta sesión</p><h2>Mejor e1RM provisional</h2><p className="muted">Se volverá definitiva cuando el historial real esté conectado.</p></div>
        <strong>{bestE1rm === null ? "—" : `${formatKg(bestE1rm)} kg`}</strong>
      </section>
      <Card className="card-soft">
        <p className="card-kicker">Snapshot</p>
        <h2>{workout.exercises.length} ejercicios registrados</h2>
        <div className="routine-meta">{workout.exercises.map((exercise) => <span key={exercise.id}>{exercise.exerciseNameSnapshot}</span>)}</div>
      </Card>
    </main>
  );
}

export function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeQuery = useActiveWorkout();
  const workoutMutations = useWorkoutMutations();
  const setMutations = useSetMutations();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [extraRows, setExtraRows] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [exerciseToRemove, setExerciseToRemove] = useState<WorkoutExercise | null>(null);
  const [completedWorkout, setCompletedWorkout] = useState<Workout | null>(null);
  const [now, setNow] = useState(Date.now());
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const clientIds = useRef<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const autoStartAttempted = useRef(false);
  const workout = activeQuery.data;
  const routineId = searchParams.get("routineId");
  const currentExercise = workout?.exercises[selectedIndex];
  const activeWorkoutId = workout?.id;
  const currentSets = useMemo(
    () => workout?.sets.filter((set) => set.workoutExerciseId === currentExercise?.id).sort((a, b) => a.setNumber - b.setNumber) ?? [],
    [currentExercise?.id, workout],
  );
  const previous = usePreviousExerciseSession(currentExercise?.exerciseId ?? "", workout?.startedAt);
  const exerciseCatalog = useExercises({ search: "", primaryMuscleId: null, equipment: null, includeArchived: false });

  useEffect(() => {
    if (!routineId || activeQuery.isPending || workout || autoStartAttempted.current || completedWorkout) return;
    autoStartAttempted.current = true;
    void workoutMutations.startFromRoutine.mutateAsync(routineId).catch((error: unknown) => {
      setStatus(messageFor(error, "No pudimos comenzar el workout."));
    });
  }, [activeQuery.isPending, completedWorkout, routineId, workout, workoutMutations.startFromRoutine]);

  useEffect(() => {
    if (workout) setSelectedIndex((index) => Math.min(index, Math.max(workout.exercises.length - 1, 0)));
  }, [workout]);

  const lastCompletedSet = currentSets.at(-1);
  const lastCompletedAt = lastCompletedSet?.completedAt;
  const restSeconds = currentExercise?.restSecondsSnapshot ?? 0;

  useEffect(() => {
    setTimerEnd(lastCompletedAt && restSeconds > 0 ? Date.parse(lastCompletedAt) + restSeconds * 1000 : null);
  }, [lastCompletedAt, restSeconds]);

  useEffect(() => {
    if (!activeWorkoutId) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [activeWorkoutId]);

  const currentRemaining = timerEnd === null ? 0 : Math.max(0, Math.ceil((timerEnd - now) / 1000));

  if (completedWorkout) return <WorkoutSummary workout={completedWorkout} onBack={() => navigate("/app")} />;

  const startRoutine = (id: string) => {
    autoStartAttempted.current = false;
    setStatus(null);
    navigate(`/app/workout/active?routineId=${encodeURIComponent(id)}`);
  };

  if (activeQuery.isPending || workoutMutations.startFromRoutine.isPending) {
    return <main className="page-content page-narrow"><Card aria-busy="true"><p className="muted">Cargando tu workout…</p></Card></main>;
  }

  if (activeQuery.isError) {
    return <main className="page-content page-narrow"><StatusBanner variant="error">No pudimos cargar tu workout. <Button variant="quiet" onClick={() => void activeQuery.refetch()}>Reintentar</Button></StatusBanner></main>;
  }

  if (!workout) return <WorkoutSetup onStart={startRoutine} status={status} />;
  if (!currentExercise) return <StatusBanner variant="error">No hay un ejercicio activo disponible.</StatusBanner>;

  const getDraft = (key: string, set?: CompletedSet): Draft => drafts[key] ?? (set ? draftFromSet(set) : emptyDraft());

  const updateDraft = (key: string, set: CompletedSet | undefined, patch: Partial<Draft>) => {
    setDrafts((current) => ({ ...current, [key]: { ...getDraft(key, set), ...patch } }));
  };

  const focusNextInput = (exerciseId: string, rowNumber: number) => {
    window.setTimeout(() => inputRefs.current[`${exerciseId}-${rowNumber + 1}-weight`]?.focus(), 0);
  };

  const confirmSet = async (exercise: WorkoutExercise, set: CompletedSet | undefined, rowNumber: number) => {
    const key = set?.id ?? `${exercise.id}-new-${rowNumber}`;
    const draft = getDraft(key, set);
    const input: SetInput = {
      id: set?.id ?? (clientIds.current[key] ??= createClientId()),
      setNumber: rowNumber,
      setType: draft.setType,
      weightKg: draft.weight.trim() === "" ? Number.NaN : Number(draft.weight),
      reps: draft.reps.trim() === "" ? Number.NaN : Number(draft.reps),
      rir: draft.rir.trim() === "" ? null : Number(draft.rir),
    };
    const validation = setInputSchema.safeParse(input);
    if (!validation.success) {
      setRowErrors((current) => ({ ...current, [key]: validation.error.issues[0]?.message ?? "Revisa los valores de la serie." }));
      return;
    }
    setRowErrors((current) => { const next = { ...current }; delete next[key]; return next; });
    try {
      if (set) {
        await setMutations.update.mutateAsync({ workoutId: workout.id, setId: set.id, input: validation.data });
      } else {
        await setMutations.create.mutateAsync({ workoutId: workout.id, workoutExerciseId: exercise.id, input: validation.data });
      }
      setStatus("Serie guardada.");
      focusNextInput(exercise.id, rowNumber);
    } catch (error) {
      setRowErrors((current) => ({ ...current, [key]: messageFor(error, "No se guardó la serie. Comprueba la conexión y reintenta.") }));
    }
  };

  const removeSet = async (set: CompletedSet) => {
    try {
      await setMutations.remove.mutateAsync({ workoutId: workout.id, setId: set.id });
      setStatus("Serie retirada de la sesión.");
    } catch (error) {
      setStatus(messageFor(error, "No pudimos retirar la serie."));
    }
  };

  const reorderSets = async (exercise: WorkoutExercise, index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= currentSets.length) return;
    const ids = currentSets.map((set) => set.id);
    [ids[index], ids[nextIndex]] = [ids[nextIndex]!, ids[index]!];
    try {
      await setMutations.reorder.mutateAsync({ workoutId: workout.id, workoutExerciseId: exercise.id, orderedSetIds: ids });
    } catch (error) {
      setStatus(messageFor(error, "No pudimos reordenar las series."));
    }
  };

  const reorderExercises = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= workout.exercises.length) return;
    const ids = workout.exercises.map((exercise) => exercise.id);
    [ids[index], ids[nextIndex]] = [ids[nextIndex]!, ids[index]!];
    try {
      await workoutMutations.reorderExercises.mutateAsync({ workoutId: workout.id, orderedExerciseIds: ids });
      setSelectedIndex(nextIndex);
    } catch (error) {
      setStatus(messageFor(error, "No pudimos reordenar los ejercicios."));
    }
  };

  const removeExercise = async () => {
    if (!exerciseToRemove) return;
    try {
      await workoutMutations.removeExercise.mutateAsync({ workoutId: workout.id, workoutExerciseId: exerciseToRemove.id });
      setExerciseToRemove(null);
      setSelectedIndex((index) => Math.min(index, Math.max(workout.exercises.length - 2, 0)));
      setStatus("Ejercicio retirado solo de esta sesión.");
    } catch (error) {
      setStatus(messageFor(error, "No pudimos retirar el ejercicio."));
    }
  };

  const addExercise = async (exerciseId: string) => {
    try {
      await workoutMutations.addExercise.mutateAsync({ workoutId: workout.id, exerciseId });
      setAddOpen(false);
      setStatus("Ejercicio añadido a esta sesión.");
    } catch (error) {
      setStatus(messageFor(error, "No pudimos añadir el ejercicio."));
    }
  };

  const complete = async () => {
    if (!workout.sets.length) {
      setStatus("Confirma al menos una serie antes de finalizar.");
      return;
    }
    try {
      const completed = await workoutMutations.complete.mutateAsync(workout.id);
      setCompletedWorkout(completed);
    } catch (error) {
      setStatus(messageFor(error, "No pudimos finalizar el workout."));
    }
  };

  const cancel = async () => {
    try {
      await workoutMutations.cancel.mutateAsync(workout.id);
      navigate("/app");
    } catch (error) {
      setStatus(messageFor(error, "No pudimos descartar el workout."));
    }
  };

  return (
    <main className="page-content active-workout-page">
      <header className="page-heading workout-page-heading">
        <div>
          <p className="eyebrow">Workout activo · {formatDuration(Math.max(0, Math.floor((Date.now() - Date.parse(workout.startedAt)) / 1000)))}</p>
          <h1>{workout.routineNameSnapshot ?? "Sesión libre"}</h1>
          <p>Registra la sesión actual. La rutina de origen permanece intacta.</p>
        </div>
        <div className="workout-heading-actions">
          <Button variant="quiet" onClick={() => setDiscardOpen(true)}><X size={16} aria-hidden="true" /> Descartar</Button>
          <Button onClick={() => void complete()} loading={workoutMutations.complete.isPending}><Check size={16} aria-hidden="true" /> Finalizar</Button>
        </div>
      </header>
      {status && <StatusBanner>{status}</StatusBanner>}
      <div className="workout-layout">
        <section className="workout-main-column">
          <Card className="workout-card">
            <div className="workout-exercise-toolbar">
              <div>
                <p className="card-kicker">Ejercicio {selectedIndex + 1} / {workout.exercises.length}</p>
                <h2>{currentExercise?.exerciseNameSnapshot}</h2>
                <p className="muted">Objetivo: {currentExercise?.targetSetsSnapshot ?? "—"} series · {currentExercise?.repMinSnapshot ?? "—"}–{currentExercise?.repMaxSnapshot ?? "—"} reps · RIR {currentExercise?.targetRirSnapshot ?? "—"}</p>
              </div>
              <div className="workout-exercise-actions">
                <Button className="icon-button" variant="quiet" aria-label="Ejercicio anterior" disabled={selectedIndex === 0} onClick={() => setSelectedIndex((index) => index - 1)}><ChevronLeft size={18} aria-hidden="true" /></Button>
                <Button className="icon-button" variant="quiet" aria-label="Siguiente ejercicio" disabled={selectedIndex === workout.exercises.length - 1} onClick={() => setSelectedIndex((index) => index + 1)}><ChevronRight size={18} aria-hidden="true" /></Button>
              </div>
            </div>
            <div className="load-rail" aria-label={`Progreso de ${workout.exercises.length} ejercicios`}>
              {workout.exercises.map((exercise, index) => <button type="button" key={exercise.id} className={`load-mark ${index === selectedIndex ? "is-current" : ""} ${workout.sets.some((set) => set.workoutExerciseId === exercise.id) ? "is-complete" : ""}`} aria-label={`Ir a ${exercise.exerciseNameSnapshot}`} onClick={() => setSelectedIndex(index)}>{index + 1}</button>)}
            </div>
            {previous.data && <div className="previous-session" aria-label="Última sesión comparable"><strong>Última vez · {formatDate(previous.data.completedAt)}</strong><span>{previous.data.sets.map((set) => `${formatKg(set.weightKg)} kg × ${set.reps}`).join(" · ")}</span></div>}
            {previous.isPending && <p className="muted previous-loading">Buscando la última vez…</p>}
            <div className="set-list" aria-label={`Series de ${currentExercise?.exerciseNameSnapshot}`}>
              {currentExercise && Array.from({ length: Math.max(currentExercise.targetSetsSnapshot ?? 1, currentSets.length, 1) + (extraRows[currentExercise.id] ?? 0) }, (_, index) => {
                const set = currentSets.find((candidate) => candidate.setNumber === index + 1);
                const key = set?.id ?? `${currentExercise.id}-new-${index + 1}`;
                const draft = getDraft(key, set);
                const error = rowErrors[key];
                return (
                  <div className={`set-row ${set ? "is-saved" : "is-draft"} ${error ? "has-error" : ""}`} key={key}>
                    <div className="set-row-heading"><span className="set-number">{String(index + 1).padStart(2, "0")}</span><span className={`tag ${draft.setType === "working" ? "tag-teal" : ""}`}>{setTypeLabels[draft.setType]}</span></div>
                    <div className="set-fields">
                      <label>Peso<input ref={(element) => { inputRefs.current[`${currentExercise.id}-${index + 1}-weight`] = element; }} className="input" inputMode="decimal" type="number" min="0" step="0.1" value={draft.weight} placeholder="kg" aria-label={`Peso de la serie ${index + 1}`} onChange={(event) => updateDraft(key, set, { weight: event.target.value })} /></label>
                      <label>Reps<input className="input" inputMode="numeric" type="number" min="1" step="1" value={draft.reps} placeholder="reps" aria-label={`Repeticiones de la serie ${index + 1}`} onChange={(event) => updateDraft(key, set, { reps: event.target.value })} /></label>
                      <label>RIR<input className="input" inputMode="numeric" type="number" min="0" max="10" step="1" value={draft.rir} placeholder="—" aria-label={`RIR de la serie ${index + 1}`} onChange={(event) => updateDraft(key, set, { rir: event.target.value })} /></label>
                      <label>Tipo<select className="input" value={draft.setType} aria-label={`Tipo de la serie ${index + 1}`} onChange={(event) => updateDraft(key, set, { setType: event.target.value as SetType })}><option value="warmup">Calentamiento</option><option value="approach">Aproximación</option><option value="working">Trabajo</option></select></label>
                    </div>
                    <div className="set-row-actions">
                      <Button className="set-confirm-button" aria-label={`${error ? "Reintentar" : set ? "Guardar cambios de" : "Confirmar"} serie ${index + 1}`} loading={(setMutations.create.isPending || setMutations.update.isPending) && !error} onClick={() => void confirmSet(currentExercise, set, index + 1)}>{error ? <RotateCcw size={18} aria-hidden="true" /> : set ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}</Button>
                      {set && <Button className="icon-button" variant="quiet" aria-label={`Eliminar serie ${index + 1}`} onClick={() => void removeSet(set)}><Trash2 size={16} aria-hidden="true" /></Button>}
                    </div>
                    {set && <div className="set-reorder-actions"><Button className="icon-button" variant="quiet" aria-label={`Subir serie ${index + 1}`} disabled={currentSets.indexOf(set) === 0} onClick={() => void reorderSets(currentExercise, currentSets.indexOf(set), -1)}><ChevronLeft size={14} aria-hidden="true" /></Button><Button className="icon-button" variant="quiet" aria-label={`Bajar serie ${index + 1}`} disabled={currentSets.indexOf(set) === currentSets.length - 1} onClick={() => void reorderSets(currentExercise, currentSets.indexOf(set), 1)}><ChevronRight size={14} aria-hidden="true" /></Button></div>}
                    {error && <div className="set-state" role="alert"><strong>No se guardó la serie.</strong> {error}</div>}
                    {!error && set && <div className="set-state" role="status" aria-live="polite">Serie guardada · el valor permanece editable.</div>}
                  </div>
                );
              })}
            </div>
            <div className="workout-card-footer">
              <Button variant="quiet" onClick={() => setExtraRows((current) => ({ ...current, [currentExercise.id]: (current[currentExercise.id] ?? 0) + 1 }))}><Plus size={16} aria-hidden="true" /> Añadir serie</Button>
              <div className="rest-timer" aria-live="polite"><Clock3 size={16} aria-hidden="true" /><span>Descanso derivado</span><strong>{formatRest(currentRemaining)}</strong>{currentRemaining > 0 && <Button variant="quiet" onClick={() => setTimerEnd(null)}>Omitir</Button>}{currentExercise.restSecondsSnapshot ? <Button variant="quiet" onClick={() => setTimerEnd(Date.now() + currentExercise.restSecondsSnapshot! * 1000)}><RotateCcw size={14} aria-hidden="true" /> Reiniciar</Button> : null}</div>
            </div>
          </Card>
        </section>
        <aside className="workout-side-column">
          <Card className="card-soft exercise-order-card">
            <div className="section-heading"><div><p className="card-kicker">Orden de la sesión</p><h2>Ejercicios</h2></div><Button className="icon-button" variant="quiet" aria-label="Añadir ejercicio" onClick={() => setAddOpen(true)}><CirclePlus size={18} aria-hidden="true" /></Button></div>
            <div className="exercise-order-list">
              {workout.exercises.map((exercise, index) => <div className={`exercise-order-row ${index === selectedIndex ? "is-current" : ""}`} key={exercise.id}><button type="button" className="exercise-order-trigger" onClick={() => setSelectedIndex(index)}><GripVertical size={15} aria-hidden="true" /><span><strong>{exercise.exerciseNameSnapshot}</strong><small>{workout.sets.filter((set) => set.workoutExerciseId === exercise.id).length} series confirmadas</small></span></button><div className="exercise-row-actions"><Button className="icon-button" variant="quiet" aria-label={`Subir ${exercise.exerciseNameSnapshot}`} disabled={index === 0} onClick={() => void reorderExercises(index, -1)}><ChevronLeft size={14} aria-hidden="true" /></Button><Button className="icon-button" variant="quiet" aria-label={`Bajar ${exercise.exerciseNameSnapshot}`} disabled={index === workout.exercises.length - 1} onClick={() => void reorderExercises(index, 1)}><ChevronRight size={14} aria-hidden="true" /></Button><Button className="icon-button" variant="quiet" aria-label={`Quitar ${exercise.exerciseNameSnapshot}`} onClick={() => setExerciseToRemove(exercise)}><Minus size={14} aria-hidden="true" /></Button></div></div>)}
            </div>
          </Card>
          <Card className="card-soft workout-note-card"><p className="card-kicker">Estado de sesión</p><p className="muted">Cada marca cian representa una serie real confirmada. Los valores sin guardar permanecen en su fila.</p><div className="workout-stat-line"><span>Confirmadas</span><strong>{workout.sets.length}</strong></div><div className="workout-stat-line"><span>Working</span><strong>{workout.sets.filter((set) => set.setType === "working").length}</strong></div></Card>
        </aside>
      </div>
      <Dialog open={addOpen} title="Añadir ejercicio" description="El ejercicio se copia solo a este workout." onClose={() => setAddOpen(false)}>
        <div className="selector-list workout-selector-list">{exerciseCatalog.data?.filter((exercise) => !workout.exercises.some((item) => item.exerciseId === exercise.id)).map((exercise) => <div className="selector-row" key={exercise.id}><div><strong>{exercise.name}</strong><small>{exercise.isSystem ? "Sistema" : "Personalizado"}</small></div><Button onClick={() => void addExercise(exercise.id)}>Añadir</Button></div>)}</div>
        {exerciseCatalog.isPending && <p className="muted">Cargando ejercicios…</p>}
        {exerciseCatalog.data?.every((exercise) => workout.exercises.some((item) => item.exerciseId === exercise.id)) && <p className="muted">Todos los ejercicios disponibles ya están en la sesión.</p>}
      </Dialog>
      <Dialog open={Boolean(exerciseToRemove)} title="Quitar ejercicio" description="La rutina de origen no cambiará." onClose={() => setExerciseToRemove(null)}>
        <div className="dialog-copy"><p>¿Quitar <strong>{exerciseToRemove?.exerciseNameSnapshot}</strong> de este workout?</p>{exerciseToRemove && workout.sets.some((set) => set.workoutExerciseId === exerciseToRemove.id) && <p className="muted">Sus series confirmadas también se retirarán de esta sesión.</p>}</div>
        <div className="dialog-footer"><Button variant="quiet" onClick={() => setExerciseToRemove(null)}>Conservar</Button><Button variant="danger" loading={workoutMutations.removeExercise.isPending} onClick={() => void removeExercise()}>Quitar ejercicio</Button></div>
      </Dialog>
      <Dialog open={discardOpen} title="Descartar workout" description="Esta acción no se puede deshacer." onClose={() => setDiscardOpen(false)}>
        <div className="dialog-copy"><p>El workout quedará cancelado y no aparecerá en el historial analítico.</p></div>
        <div className="dialog-footer"><Button variant="quiet" onClick={() => setDiscardOpen(false)}>Seguir entrenando</Button><Button variant="danger" loading={workoutMutations.cancel.isPending} onClick={() => void cancel()}>Descartar workout</Button></div>
      </Dialog>
    </main>
  );
}
