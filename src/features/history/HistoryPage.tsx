import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, History as HistoryIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useWorkoutHistory } from "../../application/workouts/history-queries";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { formatDateInTimeZone } from "../../domain/metrics/date-metrics";

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
};

const formatNumber = (value: number) => new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 }).format(value);

export function HistoryPage() {
  const { profile } = useAuth();
  const [page, setPage] = useState(1);
  const query = useWorkoutHistory(page);
  const timezone = profile?.timezone ?? "America/La_Paz";

  if (query.isPending) {
    return <main className="page-content"><Card aria-busy="true"><p className="muted">Cargando historial…</p></Card></main>;
  }

  if (query.isError || !query.data) {
    return (
      <main className="page-content page-narrow">
        <header className="page-heading"><div><p className="eyebrow">Hechos guardados</p><h1>Historial.</h1><p>Lee lo que ocurrió, sin reescribir tus sesiones.</p></div></header>
        <StatusBanner variant="error">No pudimos cargar el historial. Puedes reintentar sin perder tus datos.</StatusBanner>
        <Button className="history-retry" onClick={() => void query.refetch()}>Reintentar</Button>
      </main>
    );
  }

  const { data } = query;
  if (data.total === 0) {
    return (
      <main className="page-content page-narrow">
        <header className="page-heading"><div><p className="eyebrow">Hechos guardados</p><h1>Historial.</h1><p>Lee lo que ocurrió, sin reescribir tus sesiones.</p></div></header>
        <Card className="empty-state-card">
          <HistoryIcon size={25} aria-hidden="true" />
          <p className="eyebrow">Sin sesiones completadas</p>
          <h2>La primera marca la puedes hacer hoy.</h2>
          <p className="muted">Completa al menos una serie de trabajo y finaliza el workout para verla aquí.</p>
          <Link className="button button-primary button-link" to="/app/workout/active">Empezar entrenamiento <ArrowRight size={17} aria-hidden="true" /></Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="page-content">
      <header className="page-heading">
        <div><p className="eyebrow">Hechos guardados</p><h1>Historial.</h1><p>Lee lo que ocurrió. La rutina actual no cambia los snapshots de sesiones terminadas.</p></div>
        <Link className="button button-quiet button-link" to="/app/progress">Abrir progreso <ArrowRight size={17} aria-hidden="true" /></Link>
      </header>
      <Card className="history-panel">
        <div className="section-heading">
          <div><p className="card-kicker">{data.total} sesiones · orden descendente</p><h2>Últimos workouts</h2></div>
          <CalendarDays size={21} className="muted-icon" aria-hidden="true" />
        </div>
        <div className="history-list" aria-label="Workouts completados">
          {data.items.map((workout) => (
            <Link className="history-row" key={workout.id} to={`/app/history/${workout.id}`}>
              <div className="history-row-main">
                <strong>{formatDateInTimeZone(workout.finishedAt!, timezone)}</strong>
                <span>{workout.routineNameSnapshot ?? "Workout libre"}</span>
                <small>Snapshot · completado</small>
              </div>
              <div className="history-row-metrics">
                <span><small>Duración</small><strong>{formatDuration(workout.summary.durationSeconds)}</strong></span>
                <span><small>Series</small><strong>{workout.summary.completedSets}</strong></span>
                <span><small>Volumen</small><strong>{formatNumber(workout.summary.volumeKg)} kg</strong></span>
                <ArrowRight size={18} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
        <div className="pagination" aria-label="Paginación del historial">
          <span className="muted">Página {data.page} de {Math.max(1, Math.ceil(data.total / data.pageSize))}</span>
          <div className="row-actions">
            <Button variant="quiet" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={17} aria-hidden="true" /> Anterior</Button>
            <Button variant="quiet" aria-label="Página siguiente" disabled={!data.hasNextPage} onClick={() => setPage((current) => current + 1)}>Siguiente <ChevronRight size={17} aria-hidden="true" /></Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
