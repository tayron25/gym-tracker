import { ArrowLeft, ArrowRight, Archive, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useExerciseHistory } from "../../application/workouts/history-queries";
import { useExercisePRs } from "../../application/workouts/analytics-queries";
import { useExercise, useExerciseMutations, useMuscleGroups } from "../../application/exercises/exercise-queries";
import { RepositoryError } from "../../application/shared/repository-error";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Dialog } from "../../components/ui/Dialog";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { equipmentLabels, movementLabels, type ExerciseInput } from "../../domain/types/exercise";
import { ExerciseForm } from "./ExerciseForm";
import { formatShortDateInTimeZone } from "../../domain/metrics/date-metrics";

export function ExerciseDetailPage() {
  const { id = "" } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const query = useExercise(id);
  const muscleQuery = useMuscleGroups();
  const historyQuery = useExerciseHistory(id);
  const prsQuery = useExercisePRs(id);
  const mutations = useExerciseMutations();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const exercise = query.data;
  const muscles = muscleQuery.data ?? [];
  const muscleName = (muscleId: number) => muscles.find((muscle) => muscle.id === muscleId)?.name ?? "Sin clasificar";
  const mutationError = mutations.update.error;

  if (query.isPending) return <main className="page-content"><Card aria-busy="true">Cargando ficha…</Card></main>;
  if (query.isError || !exercise) {
    return <main className="page-content"><StatusBanner variant="error">El ejercicio no está disponible.</StatusBanner><Link className="button button-quiet button-link" to="/app/exercises">Volver al catálogo</Link></main>;
  }

  const submit = async (input: ExerciseInput) => {
    await mutations.update.mutateAsync({ id: exercise.id, input });
    setEditing(false);
    setStatus("Cambios guardados.");
  };

  const toggleArchive = async () => {
    try {
      if (exercise.isArchived) await mutations.restore.mutateAsync(exercise.id);
      else await mutations.archive.mutateAsync(exercise.id);
      navigate("/app/exercises");
    } catch (error) {
      setStatus(error instanceof RepositoryError ? error.message : "No pudimos completar la operación.");
    }
  };

  return (
    <main className="page-content page-narrow">
      <Link className="back-link" to="/app/exercises"><ArrowLeft size={16} aria-hidden="true" /> Volver a ejercicios</Link>
      <header className="page-heading detail-heading">
        <div><p className="eyebrow">Ficha de ejercicio</p><h1>{exercise.name}</h1><p>Datos de catálogo, última sesión comparable y marcas históricas.</p></div>
      </header>
      {status && <StatusBanner>{status}</StatusBanner>}
      <div className="detail-grid">
        <Card className="hero-card">
          <div className="between"><span className="tag tag-cyan">{exercise.isSystem ? "Sistema" : "Personalizado"}</span>{exercise.isArchived && <span className="tag">Archivado</span>}</div>
          <dl className="definition-grid">
            <div><dt>Músculo primario</dt><dd>{muscleName(exercise.primaryMuscleId)}</dd></div>
            <div><dt>Equipo</dt><dd>{equipmentLabels[exercise.equipment]}</dd></div>
            <div><dt>Movimiento</dt><dd>{movementLabels[exercise.movementType]}</dd></div>
            <div><dt>Ejecución</dt><dd>{exercise.isUnilateral ? "Unilateral" : "Bilateral"}</dd></div>
          </dl>
          <div className="secondary-muscles"><span className="muted">Secundarios</span><p>{exercise.secondaryMuscleIds.length ? exercise.secondaryMuscleIds.map(muscleName).join(", ") : "Sin músculos secundarios"}</p></div>
          {exercise.notes && <div className="notes-panel"><span className="muted">Notas</span><p>{exercise.notes}</p></div>}
        </Card>
        {!exercise.isSystem && (
          <Card className="card-soft">
            <p className="card-kicker">Control del catálogo</p>
            <h2>Ejercicio propio</h2>
            <p className="muted">Archivar lo oculta de los selectores, pero conserva referencias existentes.</p>
            <div className="stack-actions">
              {!exercise.isArchived && <Button onClick={() => setEditing(true)}>Editar ejercicio</Button>}
              <Button variant="quiet" onClick={() => void toggleArchive()}>
                {exercise.isArchived ? <RotateCcw size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}
                {exercise.isArchived ? "Restaurar" : "Archivar"}
              </Button>
            </div>
          </Card>
        )}
      </div>
      <div className="progress-grid exercise-history-grid">
        <Card>
          <div className="section-heading"><div><p className="card-kicker">Última vez</p><h2>Sesiones comparables</h2></div><span className="tag">working</span></div>
          {historyQuery.isPending ? <p className="muted">Cargando historial…</p> : historyQuery.data?.length ? <div className="exercise-history-list">{historyQuery.data.slice(0, 5).map((entry) => <div className="exercise-history-row" key={entry.workoutId}><div><strong>{formatShortDateInTimeZone(entry.completedAt, profile?.timezone ?? "America/La_Paz")}</strong><span>{entry.routineNameSnapshot ?? "Workout libre"}</span></div><strong>{entry.sets.filter((set) => set.setType === "working").map((set) => `${set.weightKg} × ${set.reps}`).join(" · ") || "Sin working sets"}</strong></div>)}</div> : <div className="inline-empty"><p>Primera vez.</p><span className="muted">Todavía no hay sesiones completadas para comparar.</span></div>}
        </Card>
        <Card className="card-soft">
          <p className="card-kicker">Marcas históricas</p><h2>{exercise.name}</h2>
          {prsQuery.isPending ? <p className="muted">Calculando…</p> : <div className="pr-list"><div><span>Mayor peso</span><strong>{prsQuery.data?.weightKg ?? "—"} kg</strong></div><div><span>Más repeticiones</span><strong>{prsQuery.data?.repsAtWeightKg ?? "—"}</strong></div><div><span>Mejor e1RM</span><strong>{prsQuery.data?.e1rmKg ? `${prsQuery.data.e1rmKg.toFixed(1)} kg` : "—"}</strong></div></div>}
          <Link className="button button-quiet button-link exercise-progress-link" to={`/app/progress?exercise=${exercise.id}`}>Ver progreso <ArrowRight size={17} aria-hidden="true" /></Link>
        </Card>
      </div>
      <Dialog open={editing} title="Editar ejercicio" onClose={() => { mutations.update.reset(); setEditing(false); }}>
        <ExerciseForm
          exercise={exercise}
          isSubmitting={mutations.update.isPending}
          muscles={muscles}
          onCancel={() => setEditing(false)}
          onSubmit={submit}
          submitError={mutationError ? (mutationError instanceof RepositoryError ? mutationError.message : "No pudimos guardar los cambios.") : undefined}
        />
      </Dialog>
    </main>
  );
}
