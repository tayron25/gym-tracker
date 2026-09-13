import { ArrowLeft, ArrowRight, BarChart3, ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useExercises } from "../../application/exercises/exercise-queries";
import { useExercisePRs, useExerciseTrend, useWeeklyMuscleSets } from "../../application/workouts/analytics-queries";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { formatShortDateInTimeZone, getWeekStartKey, shiftDateKey } from "../../domain/metrics/date-metrics";
import type { ProgressRange } from "../../domain/types/analytics";

const ProgressChart = lazy(() => import("./ProgressChart").then((module) => ({ default: module.ProgressChart })));
const ranges: { value: ProgressRange; label: string }[] = [{ value: "30d", label: "30 días" }, { value: "6m", label: "6 meses" }];
const convertWeight = (kg: number, unit: "kg" | "lb") => unit === "lb" ? kg * 2.20462 : kg;
const formatWeight = (kg: number | null, unit: "kg" | "lb") => kg === null ? "—" : `${new Intl.NumberFormat("es-BO", { maximumFractionDigits: 1 }).format(convertWeight(kg, unit))} ${unit}`;

export function ProgressPage() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const exerciseQuery = useExercises({ search: "", primaryMuscleId: null, equipment: null, includeArchived: false });
  const [exerciseId, setExerciseId] = useState(searchParams.get("exercise") ?? "");
  const [range, setRange] = useState<ProgressRange>("30d");
  const [weekOffset, setWeekOffset] = useState(0);
  const timezone = profile?.timezone ?? "America/La_Paz";
  const weekStartsOn = profile?.weekStartsOn ?? 1;
  const unit = profile?.weightUnit ?? "kg";
  const weekStart = shiftDateKey(getWeekStartKey(new Date(), timezone, weekStartsOn), weekOffset * 7);

  useEffect(() => {
    if (!exerciseId && exerciseQuery.data?.length) {
      setExerciseId(exerciseQuery.data.find((exercise) => exercise.id === "exercise-press-banca")?.id ?? exerciseQuery.data[0]!.id);
    }
  }, [exerciseId, exerciseQuery.data]);

  const prsQuery = useExercisePRs(exerciseId);
  const trendQuery = useExerciseTrend(exerciseId, range);
  const weeklyQuery = useWeeklyMuscleSets(weekStart, timezone);
  const selectedExercise = exerciseQuery.data?.find((exercise) => exercise.id === exerciseId);
  const trend = trendQuery.data ?? [];
  const latest = trend.at(-1);
  const first = trend[0];
  const change = latest && first ? convertWeight(latest.e1rmKg - first.e1rmKg, unit) : null;

  const weekLabel = useMemo(() => `${formatShortDateInTimeZone(`${weekStart}T12:00:00.000Z`, timezone)} — ${formatShortDateInTimeZone(`${shiftDateKey(weekStart, 6)}T12:00:00.000Z`, timezone)}`, [timezone, weekStart]);

  if (exerciseQuery.isPending) return <main className="page-content"><Card aria-busy="true"><p className="muted">Cargando progreso…</p></Card></main>;
  if (exerciseQuery.isError) return <main className="page-content page-narrow"><StatusBanner variant="error">No pudimos cargar los ejercicios para el progreso.</StatusBanner><Button onClick={() => void exerciseQuery.refetch()}>Reintentar</Button></main>;
  if (!exerciseQuery.data?.length) return <main className="page-content page-narrow"><Card className="empty-state-card"><BarChart3 size={25} aria-hidden="true" /><p className="eyebrow">Sin datos analíticos</p><h1>El progreso necesita una primera sesión.</h1><p className="muted">Completa una serie de trabajo y finaliza el workout para comparar e1RM, PR y series semanales.</p><Link className="button button-primary button-link" to="/app/workout/active">Ir a entrenar <ArrowRight size={17} aria-hidden="true" /></Link></Card></main>;

  const dataError = prsQuery.isError || trendQuery.isError || weeklyQuery.isError;
  const retryAnalytics = () => { void Promise.all([prsQuery.refetch(), trendQuery.refetch(), weeklyQuery.refetch()]); };
  return (
    <main className="page-content">
      <header className="page-heading">
        <div><p className="eyebrow">Lectura de progreso</p><h1>Lo que está cambiando.</h1><p>e1RM estimado para comparar tendencias. Las series semanales siguen el músculo primario del snapshot.</p></div>
        <Link className="button button-quiet button-link" to="/app/history"><ArrowLeft size={17} aria-hidden="true" /> Ver historial</Link>
      </header>
      {dataError && <StatusBanner variant="error"><span>No pudimos cargar una parte del progreso. Reintenta la consulta.</span><Button variant="quiet" onClick={retryAnalytics}>Reintentar</Button></StatusBanner>}
      <Card className="progress-controls">
        <div className="field-group"><label htmlFor="progress-exercise">Ejercicio</label><select className="input" id="progress-exercise" value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>{exerciseQuery.data.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}</select></div>
        <fieldset className="range-control"><legend>Rango</legend>{ranges.map((option) => <label key={option.value}><input type="radio" name="progress-range" value={option.value} checked={range === option.value} onChange={() => setRange(option.value)} />{option.label}</label>)}</fieldset>
      </Card>
      <div className="progress-grid">
        <Card className="progress-chart-card">
          <div className="section-heading"><div><p className="card-kicker">{selectedExercise?.name} · {ranges.find((option) => option.value === range)?.label}</p><h2>e1RM estimado</h2></div><span className="tag tag-cyan">{unit}</span></div>
          {trendQuery.isPending ? <p className="muted">Cargando puntos…</p> : trend.length === 0 ? <div className="inline-empty"><p>Sin datos para este rango.</p><span className="muted">Prueba un rango más amplio.</span></div> : <><Suspense fallback={<div className="chart-loading">Preparando gráfica…</div>}><ProgressChart data={trend} timezone={timezone} unit={unit} convert={(value) => convertWeight(value, unit)} /></Suspense><div className="chart-caption"><span>{formatShortDateInTimeZone(trend[0]!.completedAt, timezone)} — {formatShortDateInTimeZone(trend.at(-1)!.completedAt, timezone)}</span><strong className={change !== null && change >= 0 ? "positive-value" : "negative-value"}>{change === null ? "—" : `${change >= 0 ? "+" : ""}${new Intl.NumberFormat("es-BO", { maximumFractionDigits: 1 }).format(change)} ${unit}`}</strong></div></>}
        </Card>
        <Card className="card-soft">
          <p className="card-kicker">Marcas personales</p><h2>{selectedExercise?.name}</h2>
          {prsQuery.isPending ? <p className="muted">Calculando marcas…</p> : <div className="pr-list"><div><span>Mayor peso</span><strong>{formatWeight(prsQuery.data?.weightKg ?? null, unit)}</strong></div><div><span>Más repeticiones</span><strong>{prsQuery.data?.repsAtWeightKg ?? "—"} {prsQuery.data?.repsAtWeightKg ? `a ${formatWeight(prsQuery.data.repsWeightKg, unit)}` : ""}</strong></div><div><span>Mejor e1RM</span><strong>{formatWeight(prsQuery.data?.e1rmKg ?? null, unit)}</strong></div></div>}
        </Card>
      </div>
      <Card className="weekly-card">
        <div className="section-heading"><div><p className="card-kicker">Solo working sets completados</p><h2>Series por músculo</h2><p className="muted">{weekLabel}</p></div><Dumbbell size={21} className="muted-icon" aria-hidden="true" /></div>
        {weeklyQuery.isPending ? <p className="muted">Cargando semana…</p> : <>{weeklyQuery.data?.length ? <div className="weekly-list">{weeklyQuery.data.map((muscle) => <div className="weekly-row" key={muscle.muscleGroupId}><span>{muscle.muscleName}</span><div className="weekly-bar"><span style={{ width: `${Math.min(100, muscle.setCount * 8)}%` }} /></div><strong>{muscle.setCount}</strong></div>)}</div> : <div className="inline-empty"><p>No hay series de trabajo en esta semana.</p><span className="muted">Navega a otra semana para revisar actividad.</span></div>}<div className="pagination weekly-pagination"><Button variant="quiet" onClick={() => setWeekOffset((current) => current - 1)}><ChevronLeft size={17} aria-hidden="true" /> Semana anterior</Button><span className="muted">{weekOffset === 0 ? "Esta semana" : `${Math.abs(weekOffset)} semana${Math.abs(weekOffset) === 1 ? "" : "s"} ${weekOffset < 0 ? "atrás" : "adelante"}`}</span><Button variant="quiet" disabled={weekOffset >= 0} onClick={() => setWeekOffset((current) => current + 1)}>Semana siguiente <ChevronRight size={17} aria-hidden="true" /></Button></div></>}
      </Card>
      <Card className="trend-table-card">
        <div className="section-heading"><div><p className="card-kicker">Tabla equivalente</p><h2>Los puntos detrás de la línea</h2></div><Link className="button button-quiet button-link" to="/app/history">Ver sesiones <ArrowRight size={17} aria-hidden="true" /></Link></div>
        {trend.length === 0 ? <p className="muted">No hay sesiones elegibles para mostrar.</p> : <div className="table-scroll"><table className="history-table"><caption className="sr-only">Tendencia de e1RM</caption><thead><tr><th>Fecha</th><th>Mejor serie</th><th>e1RM</th><th>Fuente</th></tr></thead><tbody>{trend.slice().reverse().map((point) => <tr key={point.workoutId}><td>{formatShortDateInTimeZone(point.completedAt, timezone)}</td><td>{formatWeight(point.weightKg, unit)} × {point.reps}</td><td>{formatWeight(point.e1rmKg, unit)}</td><td>{point.routineNameSnapshot ?? "Workout libre"}</td></tr>)}</tbody></table></div>}
      </Card>
    </main>
  );
}
