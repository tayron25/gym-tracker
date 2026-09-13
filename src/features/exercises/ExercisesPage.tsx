import { Archive, Plus, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useExerciseMutations, useExercises, useMuscleGroups } from "../../application/exercises/exercise-queries";
import { RepositoryError } from "../../application/shared/repository-error";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Dialog } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { equipmentLabels, type EquipmentType, type Exercise, type ExerciseInput } from "../../domain/types/exercise";
import { ExerciseForm } from "./ExerciseForm";

const errorMessage = (error: unknown) =>
  error instanceof RepositoryError ? error.message : "No pudimos completar la operación. Inténtalo de nuevo.";

export function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [primaryMuscleId, setPrimaryMuscleId] = useState<number | null>(null);
  const [equipment, setEquipment] = useState<EquipmentType | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [formExercise, setFormExercise] = useState<Exercise | null | "new">(null);
  const [status, setStatus] = useState<string | null>(null);
  const filters = useMemo(
    () => ({ search, primaryMuscleId, equipment, includeArchived }),
    [equipment, includeArchived, primaryMuscleId, search],
  );
  const query = useExercises(filters);
  const muscleQuery = useMuscleGroups();
  const mutations = useExerciseMutations();
  const formMutation = formExercise === "new" ? mutations.create : mutations.update;
  const hasFilters = Boolean(search || primaryMuscleId || equipment);
  const muscles = muscleQuery.data ?? [];
  const muscleName = (id: number) => muscles.find((muscle) => muscle.id === id)?.name ?? "Sin clasificar";

  const closeForm = () => {
    formMutation.reset();
    setFormExercise(null);
  };

  const submitExercise = async (input: ExerciseInput) => {
    try {
      if (formExercise === "new") {
        await mutations.create.mutateAsync(input);
        setStatus("Ejercicio creado y disponible en tus rutinas.");
      } else if (formExercise) {
        await mutations.update.mutateAsync({ id: formExercise.id, input });
        setStatus("Cambios guardados.");
      }
      closeForm();
    } catch {
      // La mutación conserva el formulario abierto y expone su error estable.
    }
  };

  const toggleArchive = async (exercise: Exercise) => {
    setStatus(null);
    try {
      if (exercise.isArchived) {
        await mutations.restore.mutateAsync(exercise.id);
        setStatus("Ejercicio restaurado.");
      } else {
        await mutations.archive.mutateAsync(exercise.id);
        setStatus("Ejercicio archivado. Las rutinas que lo usan conservan la referencia.");
      }
    } catch (error) {
      setStatus(errorMessage(error));
    }
  };

  return (
    <main className="page-content">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Catálogo de movimientos</p>
          <h1>Ejercicios.</h1>
          <p>Busca movimientos del sistema y crea variantes propias sin alterar las referencias existentes.</p>
        </div>
        <Button onClick={() => setFormExercise("new")}><Plus size={17} aria-hidden="true" /> Nuevo ejercicio</Button>
      </header>

      {status && <StatusBanner>{status}</StatusBanner>}
      <Card className="filter-card">
        <div className="search-control">
          <Search size={17} aria-hidden="true" />
          <Input aria-label="Buscar ejercicios" placeholder="Buscar por nombre" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Select aria-label="Filtrar por músculo primario" value={primaryMuscleId ?? ""} onChange={(event) => setPrimaryMuscleId(event.target.value ? Number(event.target.value) : null)}>
          <option value="">Todos los músculos</option>
          {muscles.map((muscle) => <option key={muscle.id} value={muscle.id}>{muscle.name}</option>)}
        </Select>
        <Select aria-label="Filtrar por equipo" value={equipment ?? ""} onChange={(event) => setEquipment((event.target.value || null) as EquipmentType | null)}>
          <option value="">Todo el equipo</option>
          {Object.entries(equipmentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
        <label className="check-control filter-check">
          <input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} />
          <span>Mostrar archivados</span>
        </label>
        <Button variant="quiet" disabled={!hasFilters} onClick={() => { setSearch(""); setPrimaryMuscleId(null); setEquipment(null); }}>
          Limpiar filtros
        </Button>
      </Card>

      {query.isPending && <Card aria-busy="true"><p className="muted">Cargando ejercicios…</p></Card>}
      {query.isError && (
        <StatusBanner variant="error">No pudimos cargar los ejercicios. <Button variant="quiet" onClick={() => void query.refetch()}>Reintentar</Button></StatusBanner>
      )}
      {query.data?.length === 0 && (
        <Card className="empty-card compact-empty"><div><p className="eyebrow">Sin resultados</p><h2>{hasFilters ? "Ningún ejercicio coincide." : "Crea tu primer ejercicio."}</h2><p className="muted">{hasFilters ? "Limpia los filtros o cambia la búsqueda." : "Los ejercicios propios quedan disponibles en tus rutinas."}</p></div></Card>
      )}
      <section className="catalog-grid" aria-label="Resultados de ejercicios">
        {query.data?.map((exercise) => (
          <Card className={`catalog-card ${exercise.isArchived ? "is-archived" : ""}`} key={exercise.id}>
            <div className="between">
              <span className={`tag ${exercise.isSystem ? "" : "tag-cyan"}`}>{exercise.isSystem ? "Sistema" : "Personalizado"}</span>
              {exercise.isArchived && <span className="tag">Archivado</span>}
            </div>
            <h2>{exercise.name}</h2>
            <p className="catalog-meta">{muscleName(exercise.primaryMuscleId)} · {equipmentLabels[exercise.equipment]}</p>
            <div className="card-actions">
              <Link className="button button-quiet button-link" to={`/app/exercises/${exercise.id}`}>Ver ficha</Link>
              {!exercise.isSystem && (
                <>
                  {!exercise.isArchived && <Button variant="quiet" onClick={() => setFormExercise(exercise)}>Editar</Button>}
                  <Button variant="quiet" onClick={() => void toggleArchive(exercise)}>
                    {exercise.isArchived ? <RotateCcw size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}
                    {exercise.isArchived ? "Restaurar" : "Archivar"}
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </section>

      <Dialog
        open={formExercise !== null}
        title={formExercise === "new" ? "Nuevo ejercicio" : "Editar ejercicio"}
        description="El nombre y el músculo primario son obligatorios."
        onClose={closeForm}
      >
        <ExerciseForm
          exercise={formExercise === "new" ? undefined : formExercise ?? undefined}
          isSubmitting={formMutation.isPending}
          muscles={muscles}
          onCancel={closeForm}
          onSubmit={submitExercise}
          submitError={formMutation.error ? errorMessage(formMutation.error) : undefined}
        />
      </Dialog>
    </main>
  );
}
