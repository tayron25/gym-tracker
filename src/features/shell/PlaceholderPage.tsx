import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function PlaceholderPage({ description, eyebrow, icon: Icon, title }: PlaceholderPageProps) {
  return (
    <main className="page-content page-narrow">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      <Card className="empty-card">
        <span className="empty-icon"><Icon size={24} aria-hidden="true" /></span>
        <div>
          <p className="card-kicker">Destino preparado</p>
          <h2>Esta parte llega en su sprint.</h2>
          <p className="muted">SPR-03 deja la ruta disponible y protegida sin adelantar funcionalidad.</p>
        </div>
        <div className="placeholder-actions">
          <Link className="button button-quiet button-link" to="/app">
            <ArrowLeft size={17} aria-hidden="true" /> Volver a inicio
          </Link>
          <Construction size={19} className="muted-icon" aria-hidden="true" />
        </div>
      </Card>
    </main>
  );
}

