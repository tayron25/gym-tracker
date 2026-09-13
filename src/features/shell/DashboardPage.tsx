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
          <p>El shell está listo para que cada sprint añada una parte del registro de fuerza.</p>
        </div>
        <Link className="button button-primary button-link" to="/app/workout/active">
          Abrir entrenamiento <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </header>

      <div className="dashboard-grid">
        <Card className="hero-card">
          <div className="card-kicker">SPR-03 · Shell frontend</div>
          <h2>La navegación ya tiene un lugar para cada sesión.</h2>
          <p className="muted">
            Las pantallas de rutinas, workout, historial y progreso están preparadas como destinos
            seguros. Su comportamiento llegará en los sprints correspondientes.
          </p>
          <div className="rail" aria-label="Progreso de preparación">
            <span className="rail-mark rail-complete">01</span>
            <span className="rail-mark rail-current">02</span>
            <span className="rail-mark">03</span>
            <span className="rail-mark">04</span>
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
          <h2>Tu shell no pierde contexto.</h2>
          <p className="muted">Usa el menú para revisar los destinos disponibles sin modificar datos de entrenamiento.</p>
        </div>
        <Link className="button button-quiet button-link" to="/app/settings">
          Revisar perfil <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
