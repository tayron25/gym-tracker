import { Archive, Copy, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRoutines, useRoutineMutations } from "../../application/routines/routine-queries";
import { RepositoryError } from "../../application/shared/repository-error";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBanner } from "../../components/ui/StatusBanner";
import type { Routine } from "../../domain/types/routine";

const messageFor = (error: unknown) =>
  error instanceof RepositoryError ? error.message : "No pudimos completar la operación. Inténtalo de nuevo.";

export function RoutinesPage() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const query = useRoutines(includeArchived);
  const mutations = useRoutineMutations();

  const duplicate = async (routine: Routine) => {
    setStatus(null);
    try {
      const copy = await mutations.duplicate.mutateAsync(routine.id);
      setStatus(`${copy.name} creada con ejercicios y objetivos independientes.`);
    } catch (error) {
      setStatus(messageFor(error));
    }
  };

  const toggleArchive = async (routine: Routine) => {
    setStatus(null);
    try {
      if (routine.isArchived) {
        await mutations.restore.mutateAsync(routine.id);
        setStatus("Rutina restaurada.");
      } else {
        await mutations.archive.mutateAsync(routine.id);
        setStatus("Rutina archivada. La copia y los datos simulados existentes no cambiaron.");
      }
    } catch (error) {
      setStatus(messageFor(error));
    }
  };

  return (
    <main className="page-content">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Plantillas editables</p>
          <h1>Rutinas.</h1>
          <p>Prepara el orden y los objetivos. Cada rutina puede cambiar sin convertirse en historial.</p>
        </div>
        <Link className="button button-primary button-link" to="/app/routines/new"><Plus size={17} aria-hidden="true" /> Nueva rutina</Link>
      </header>
      {status && <StatusBanner>{status}</StatusBanner>}
      <div className="section-toolbar">
        <p className="muted">{query.data?.filter((routine) => !routine.isArchived).length ?? 0} rutinas activas</p>
        <label className="check-control">
          <input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} />
          <span>Mostrar archivadas</span>
        </label>
      </div>
      {query.isPending && <Card aria-busy="true"><p className="muted">Cargando rutinas…</p></Card>}
      {query.isError && <StatusBanner variant="error">No pudimos cargar las rutinas. <Button variant="quiet" onClick={() => void query.refetch()}>Reintentar</Button></StatusBanner>}
      {query.data?.length === 0 && (
        <Card className="empty-state-card">
          <p className="eyebrow">Todavía no hay plantillas</p>
          <h2>Tu primer entrenamiento empieza con una estructura.</h2>
          <p className="muted">Puedes guardar un borrador vacío y añadir ejercicios cuando estés listo.</p>
          <Link className="button button-primary button-link" to="/app/routines/new">Crear primera rutina</Link>
        </Card>
      )}
      <section className="routine-cards" aria-label="Lista de rutinas">
        {query.data?.map((routine) => (
          <Card className={`routine-card ${routine.isArchived ? "is-archived" : ""}`} key={routine.id}>
            <div className="routine-card-main">
              <div className="between">
                <span className={`tag ${routine.items.length ? "tag-teal" : ""}`}>{routine.items.length ? "Lista" : "Borrador"}</span>
                {routine.isArchived && <span className="tag">Archivada</span>}
              </div>
              <h2>{routine.name}</h2>
              <p>{routine.description || "Sin descripción"}</p>
              <div className="routine-stats"><span>{routine.items.length} ejercicios</span><span>{routine.items.reduce((total, item) => total + item.targetSets, 0)} series objetivo</span></div>
            </div>
            <div className="card-actions">
              <Link className="button button-primary button-link" to={`/app/routines/${routine.id}`}>{routine.isArchived ? "Ver" : "Editar"}</Link>
              {!routine.isArchived && <Button variant="quiet" onClick={() => void duplicate(routine)}><Copy size={16} aria-hidden="true" /> Duplicar</Button>}
              <Button variant="quiet" onClick={() => void toggleArchive(routine)}>
                {routine.isArchived ? <RotateCcw size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}
                {routine.isArchived ? "Restaurar" : "Archivar"}
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
