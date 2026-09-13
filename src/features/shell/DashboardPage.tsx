import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export function DashboardPage() {
  return (
    <main className="page-content">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Tu espacio privado</p>
          <h1>Entrena con intención.</h1>
          <p>La sesión activa ya permite registrar cada serie con contexto, confirmación y reintento.</p>
        </div>
        <Link className="button button-primary button-link" to="/app/workout/active">
          Abrir entrenamiento <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </header>

      <div className="dashboard-grid">
        <Card className="hero-card">
          <div className="card-kicker">SPR-05 · Workout activo</div>
          <h2>Tu próxima sesión ya tiene un lugar.</h2>
          <p className="muted">
            Abre una rutina, registra peso y repeticiones, y conserva los valores aunque una operación
            necesite reintento.
          </p>
          <div className="rail" aria-label="Progreso de preparación">
            <span className="rail-mark rail-complete">01</span>
            <span className="rail-mark rail-complete">02</span>
            <span className="rail-mark rail-complete">03</span>
            <span className="rail-mark rail-complete">04</span>
            <span className="rail-mark rail-current">05</span>
          </div>
        </Card>
        <Card className="card-soft">
          <div className="card-kicker">Estado de sesión</div>
          <div className="status-list">
            <div><CheckCircle2 size={17} aria-hidden="true" /><span>Sesión simulada activa</span></div>
            <div><ShieldCheck size={17} aria-hidden="true" /><span>Rutas privadas protegidas</span></div>
          </div>
          <p className="card-footnote">La seguridad real se conectará con el backend después del frontend mock.</p>
        </Card>
      </div>

      <section className="card next-sprint-card">
        <div>
          <p className="card-kicker">Siguiente lectura</p>
          <h2>Prepara la estructura que repetirás.</h2>
          <p className="muted">Las rutinas siguen siendo editables; cada workout conserva su propia fotografía.</p>
        </div>
        <Link className="button button-quiet button-link" to="/app/routines">
          Abrir rutinas <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
