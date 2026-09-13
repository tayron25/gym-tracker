import { ArrowLeft, BarChart3, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useHistoryMutations, useWorkoutDetail } from "../../application/workouts/history-queries";
import { RepositoryError } from "../../application/shared/repository-error";
import { calculateSessionBestE1rm, calculateWorkoutSummary } from "../../domain/metrics/workout-metrics";
import { formatDateInTimeZone } from "../../domain/metrics/date-metrics";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Dialog } from "../../components/ui/Dialog";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { Textarea } from "../../components/ui/Textarea";

const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const formatWeight = (kg: number, unit: "kg" | "lb") => `${new Intl.NumberFormat("es-BO", { maximumFractionDigits: 1 }).format(unit === "lb" ? kg * 2.20462 : kg)} ${unit}`;

export function HistoryDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const query = useWorkoutDetail(id);
  const mutations = useHistoryMutations();
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const timezone = profile?.timezone ?? "America/La_Paz";
  const unit = profile?.weightUnit ?? "kg";

  useEffect(() => {
    if (query.data) setNotes(query.data.notes ?? "");
  }, [query.data]);

  const groupedExercises = useMemo(() => query.data?.exercises.map((exercise) => ({
    exercise,
    sets: query.data?.sets.filter((set) => set.workoutExerciseId === exercise.id) ?? [],
  })) ?? [], [query.data]);

  if (query.isPending) return <main className="page-content"><Card aria-busy="true"><p className="muted">Cargando detalle…</p></Card></main>;
  if (query.isError || !query.data) return <main className="page-content page-narrow"><StatusBanner variant="error">El workout histórico no está disponible.</StatusBanner><div className="row-actions"><Button onClick={() => void query.refetch()}>Reintentar</Button><Link className="button button-quiet button-link" to="/app/history">Volver al historial</Link></div></main>;

  const workout = query.data;
  const summary = calculateWorkoutSummary(workout);
  const bestE1rm = calculateSessionBestE1rm(workout.sets);

  const saveNotes = async () => {
    setStatus(null);
    try {
      await mutations.updateNotes.mutateAsync({ workoutId: workout.id, notes });
      setStatus("Nota guardada.");
    } catch (error) {
      setStatus(error instanceof RepositoryError ? error.message : "No pudimos guardar la nota.");
    }
  };

  const deleteWorkout = async () => {
    setStatus(null);
    try {
      await mutations.deleteWorkout.mutateAsync(workout.id);
      navigate("/app/history", { replace: true });
    } catch (error) {
      setDeleteOpen(false);
      setStatus(error instanceof RepositoryError ? error.message : "No pudimos eliminar el workout.");
    }
  };

  return (
    <main className="page-content page-narrow">
      <Link className="back-link" to="/app/history"><ArrowLeft size={16} aria-hidden="true" /> Volver al historial</Link>
      <header className="page-heading detail-heading">
        <div><p className="eyebrow">Detalle snapshot · {formatDateInTimeZone(workout.finishedAt!, timezone)}</p><h1>{workout.routineNameSnapshot ?? "Workout libre"}</h1><p>Este es el registro de ese día; no la versión actual de la rutina.</p></div>
        <div className="row-actions"><Link className="button button-quiet button-link" to="/app/progress"><BarChart3 size={17} aria-hidden="true" /> Ver progreso</Link><Button variant="danger" onClick={() => setDeleteOpen(true)}><Trash2 size={17} aria-hidden="true" /> Eliminar</Button></div>
      </header>
      {status && <StatusBanner variant={status.includes("guardada") ? "success" : "error"}>{status}</StatusBanner>}
      <div className="detail-grid history-detail-grid">
        <Card className="hero-card">
          <div className="between"><div><p className="card-kicker">Estado</p><h2>Completado</h2></div><span className="tag tag-teal">READ-ONLY</span></div>
          <div className="metric-grid">
            <div className="metric"><div className="metric-label">Duración</div><div className="metric-value">{formatDuration(summary.durationSeconds)}</div></div>
            <div className="metric"><div className="metric-label">Ejercicios</div><div className="metric-value">{summary.exerciseCount}</div></div>
            <div className="metric"><div className="metric-label">Volumen</div><div className="metric-value">{new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 }).format(summary.volumeKg)} kg</div></div>
          </div>
          {bestE1rm !== null && <div className="summary-pr"><div><p className="card-kicker">Marca destacada</p><strong>Mejor e1RM estimado</strong></div><strong>{formatWeight(bestE1rm, unit)}</strong></div>}
        </Card>
        <Card className="card-soft">
          <div className="card-kicker">Nota privada</div>
          <label className="field-group" htmlFor="history-notes"><span className="sr-only">Nota del workout</span><Textarea id="history-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} /></label>
          <div className="card-actions history-note-actions"><Button loading={mutations.updateNotes.isPending} onClick={() => void saveNotes()}>Guardar nota</Button></div>
          <p className="card-footnote">Solo puedes editar la nota; el rendimiento histórico permanece intacto.</p>
        </Card>
      </div>
      <Card className="history-performance-card">
        <div className="section-heading"><div><p className="card-kicker">Rendimiento</p><h2>Series guardadas</h2></div><span className="tag">kg canónico</span></div>
        <div className="history-exercise-list">
          {groupedExercises.map(({ exercise, sets }) => {
            const exerciseBestE1rm = calculateSessionBestE1rm(sets);
            return (
              <article className="history-exercise" key={exercise.id}>
                <div className="between"><div><h3>{exercise.exerciseNameSnapshot}</h3><p className="muted">Músculo primario del snapshot · {sets.length} series</p></div><span className="tag">{exerciseBestE1rm === null ? "Sin e1RM" : `${formatWeight(exerciseBestE1rm, unit)} e1RM`}</span></div>
                <div className="history-set-values">{sets.map((set) => <span key={set.id} className={`tag ${set.setType === "working" ? "tag-cyan" : ""}`}>{set.setType} · {formatWeight(set.weightKg, unit)} × {set.reps}</span>)}</div>
              </article>
            );
          })}
        </div>
      </Card>
      <Dialog open={deleteOpen} title="Eliminar workout histórico" description="Esta acción no se puede deshacer y quitará sus datos de las métricas." onClose={() => setDeleteOpen(false)}>
        <div className="dialog-copy"><p>El workout se eliminará del historial y PR, tendencia y series semanales se recalcularán.</p><p>La rutina original no se verá afectada.</p></div>
        <div className="dialog-footer"><Button variant="quiet" onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="danger" loading={mutations.deleteWorkout.isPending} onClick={() => void deleteWorkout()}>Eliminar workout</Button></div>
      </Dialog>
    </main>
  );
}
