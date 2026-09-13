import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { z } from "zod";
import { useExercises } from "../../application/exercises/exercise-queries";
import { useRoutine, useRoutineMutations } from "../../application/routines/routine-queries";
import { RepositoryError } from "../../application/shared/repository-error";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Dialog } from "../../components/ui/Dialog";
import { FieldError } from "../../components/ui/FieldError";
import { Input } from "../../components/ui/Input";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { Textarea } from "../../components/ui/Textarea";
import type { Exercise } from "../../domain/types/exercise";
import { isRoutineReady, normalizeName, routineInputSchema } from "../../domain/validation/training-validation";

type RoutineFormValues = z.infer<typeof routineInputSchema>;

const defaultValues: RoutineFormValues = { name: "", description: null, items: [] };
const optionalNumber = { setValueAs: (value: string) => value === "" ? null : Number(value) };
const newId = () => `draft-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now()}`;

const describeRange = (minimum: number | null, maximum: number | null) => {
  if (minimum !== null && maximum !== null) return `${minimum}–${maximum} reps`;
  if (minimum !== null) return `Desde ${minimum} reps`;
  if (maximum !== null) return `Hasta ${maximum} reps`;
  return "Reps libres";
};

export function RoutineEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const routineQuery = useRoutine(id ?? "");
  const exerciseQuery = useExercises({ search: "", primaryMuscleId: null, equipment: null, includeArchived: true });
  const mutations = useRoutineMutations();
  const mutation = isNew ? mutations.create : mutations.update;
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
  } = useForm<RoutineFormValues>({ resolver: zodResolver(routineInputSchema), defaultValues });
  const { append, replace } = useFieldArray({ control, name: "items", keyName: "formKey" });
  const items = useWatch({ control, name: "items" }) ?? [];
  const routineName = useWatch({ control, name: "name" }) ?? "";
  const routine = routineQuery.data;
  const readOnly = Boolean(routine?.isArchived);
  const allExercises = useMemo(() => exerciseQuery.data ?? [], [exerciseQuery.data]);
  const exerciseById = (exerciseId: string) => allExercises.find((exercise) => exercise.id === exerciseId);

  useEffect(() => {
    if (routine) reset({ name: routine.name, description: routine.description, items: routine.items });
  }, [reset, routine]);

  const availableExercises = useMemo(() => {
    const search = normalizeName(selectorSearch);
    return allExercises.filter((exercise) => !exercise.isArchived && (!search || exercise.normalizedName.includes(search)));
  }, [allExercises, selectorSearch]);

  const addExercise = (exercise: Exercise) => {
    if (items.some((item) => item.exerciseId === exercise.id)) return;
    append({
      id: newId(),
      exerciseId: exercise.id,
      position: items.length + 1,
      targetSets: 3,
      repMin: 8,
      repMax: 12,
      targetRir: 2,
      restSeconds: 90,
      notes: null,
    });
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const reordered = [...getValues("items")];
    const [moved] = reordered.splice(from, 1);
    if (!moved) return;
    reordered.splice(to, 0, moved);
    replace(reordered.map((item, index) => ({ ...item, position: index + 1 })));
  };

  const removeItem = (itemIndex: number) => {
    const remaining = getValues("items").filter((_, index) => index !== itemIndex);
    replace(remaining.map((item, index) => ({ ...item, position: index + 1 })));
  };

  const submit = async (values: RoutineFormValues) => {
    setSavedMessage(null);
    const input = {
      ...values,
      name: values.name.trim(),
      description: values.description?.trim() || null,
      items: values.items.map((item, index) => ({ ...item, position: index + 1, notes: item.notes?.trim() || null })),
    };
    try {
      if (isNew) {
        const created = await mutations.create.mutateAsync(input);
        setSavedMessage("Rutina guardada. Los cambios sobreviven una recarga de esta sesión.");
        navigate(`/app/routines/${created.id}`, { replace: true });
      } else if (id) {
        await mutations.update.mutateAsync({ id, input });
        setSavedMessage("Rutina guardada. Los cambios sobreviven una recarga de esta sesión.");
      }
    } catch {
      // El error estable de la mutación se presenta dentro del formulario.
    }
  };

  if (!isNew && routineQuery.isPending) return <main className="page-content"><Card aria-busy="true">Cargando rutina…</Card></main>;
  if (!isNew && (routineQuery.isError || !routine)) {
    return <main className="page-content"><StatusBanner variant="error">La rutina no está disponible.</StatusBanner><Link className="button button-quiet button-link" to="/app/routines">Volver a rutinas</Link></main>;
  }

  const mutationError = mutation.error;
  const errorText = mutationError
    ? mutationError instanceof RepositoryError ? mutationError.message : "No pudimos guardar la rutina. Inténtalo de nuevo."
    : null;

  return (
    <main className="page-content">
      <Link className="back-link" to="/app/routines"><ArrowLeft size={16} aria-hidden="true" /> Volver a rutinas</Link>
      <header className="page-heading detail-heading">
        <div><p className="eyebrow">Editor de plantilla</p><h1>{isNew ? "Nueva rutina." : routine?.name}</h1><p>Ordena ejercicios y define objetivos. Esto no crea ni modifica un workout.</p></div>
      </header>
      {readOnly && <StatusBanner>Esta rutina está archivada. Restáurala desde la lista para volver a editarla.</StatusBanner>}
      {savedMessage && <StatusBanner variant="success">{savedMessage}</StatusBanner>}
      <form className="routine-editor-layout" onSubmit={handleSubmit(submit)} noValidate>
        <div className="routine-editor-main">
          <Card>
            <div className="section-heading"><div><p className="card-kicker">Identidad</p><h2>Datos de la rutina</h2></div><span className={`tag ${isRoutineReady(routineName, items) ? "tag-teal" : ""}`}>{isRoutineReady(routineName, items) ? "Lista" : "Borrador"}</span></div>
            {errorText && <StatusBanner variant="error">{errorText}</StatusBanner>}
            <div className="form-stack">
              <div className="field-group">
                <label htmlFor="routine-name">Nombre</label>
                <Input id="routine-name" disabled={readOnly} aria-invalid={Boolean(errors.name)} {...register("name")} />
                <FieldError id="routine-name-error" message={errors.name?.message} />
              </div>
              <div className="field-group">
                <label htmlFor="routine-description">Descripción <span className="muted">(opcional)</span></label>
                <Textarea id="routine-description" disabled={readOnly} rows={3} {...register("description")} />
                <FieldError id="routine-description-error" message={errors.description?.message} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="section-heading">
              <div><p className="card-kicker">Orden de ejecución</p><h2>Ejercicios</h2></div>
              {!readOnly && <Button type="button" onClick={() => setSelectorOpen(true)}><Plus size={16} aria-hidden="true" /> Añadir ejercicio</Button>}
            </div>
            {!items.length && (
              <div className="inline-empty"><p>Añade un ejercicio para preparar el entrenamiento.</p>{!readOnly && <Button type="button" variant="quiet" onClick={() => setSelectorOpen(true)}>Abrir selector</Button>}</div>
            )}
            <div className="routine-item-list">
              {items.map((item, index) => {
                const exercise = exerciseById(item.exerciseId);
                const itemErrors = errors.items?.[index];
                return (
                  <article className="routine-item" key={item.id}>
                    <div className="routine-item-heading">
                      <span className="order-mark" aria-label={`Posición ${index + 1}`}>{String(index + 1).padStart(2, "0")}</span>
                      <div><h3>{exercise?.name ?? "Ejercicio archivado"}</h3><p>{exercise?.isArchived ? "Archivado · se conserva en esta rutina" : "Objetivos de la plantilla"}</p></div>
                      {!readOnly && (
                        <div className="row-actions">
                          <Button type="button" className="icon-button" variant="quiet" disabled={index === 0} aria-label={`Subir ${exercise?.name ?? "ejercicio"}`} onClick={() => moveItem(index, index - 1)}><ArrowUp size={16} aria-hidden="true" /></Button>
                          <Button type="button" className="icon-button" variant="quiet" disabled={index === items.length - 1} aria-label={`Bajar ${exercise?.name ?? "ejercicio"}`} onClick={() => moveItem(index, index + 1)}><ArrowDown size={16} aria-hidden="true" /></Button>
                          <Button type="button" className="icon-button" variant="quiet" aria-label={`Quitar ${exercise?.name ?? "ejercicio"}`} onClick={() => removeItem(index)}><Trash2 size={16} aria-hidden="true" /></Button>
                        </div>
                      )}
                    </div>
                    <input type="hidden" {...register(`items.${index}.id`)} />
                    <input type="hidden" {...register(`items.${index}.exerciseId`)} />
                    <input type="hidden" {...register(`items.${index}.position`, { valueAsNumber: true })} />
                    <div className="target-grid">
                      <div className="field-group"><label htmlFor={`sets-${index}`}>Series</label><Input id={`sets-${index}`} type="number" inputMode="numeric" min={1} max={20} disabled={readOnly} {...register(`items.${index}.targetSets`, { valueAsNumber: true })} /><FieldError id={`sets-${index}-error`} message={itemErrors?.targetSets?.message} /></div>
                      <div className="field-group"><label htmlFor={`rep-min-${index}`}>Reps mín.</label><Input id={`rep-min-${index}`} type="number" inputMode="numeric" min={1} max={100} disabled={readOnly} {...register(`items.${index}.repMin`, optionalNumber)} /><FieldError id={`rep-min-${index}-error`} message={itemErrors?.repMin?.message} /></div>
                      <div className="field-group"><label htmlFor={`rep-max-${index}`}>Reps máx.</label><Input id={`rep-max-${index}`} type="number" inputMode="numeric" min={1} max={100} disabled={readOnly} {...register(`items.${index}.repMax`, optionalNumber)} /><FieldError id={`rep-max-${index}-error`} message={itemErrors?.repMax?.message} /></div>
                      <div className="field-group"><label htmlFor={`rir-${index}`}>RIR</label><Input id={`rir-${index}`} type="number" inputMode="numeric" min={0} max={10} disabled={readOnly} {...register(`items.${index}.targetRir`, optionalNumber)} /><FieldError id={`rir-${index}-error`} message={itemErrors?.targetRir?.message} /></div>
                      <div className="field-group"><label htmlFor={`rest-${index}`}>Descanso (s)</label><Input id={`rest-${index}`} type="number" inputMode="numeric" min={0} max={3600} disabled={readOnly} {...register(`items.${index}.restSeconds`, optionalNumber)} /><FieldError id={`rest-${index}-error`} message={itemErrors?.restSeconds?.message} /></div>
                      <div className="field-group target-notes"><label htmlFor={`notes-${index}`}>Nota</label><Input id={`notes-${index}`} disabled={readOnly} placeholder="Opcional" {...register(`items.${index}.notes`)} /><FieldError id={`notes-${index}-error`} message={itemErrors?.notes?.message} /></div>
                    </div>
                  </article>
                );
              })}
            </div>
          </Card>
          {!readOnly && <div className="sticky-form-actions"><Link className="button button-quiet button-link" to="/app/routines">Cancelar</Link><Button type="submit" loading={mutation.isPending}>{isNew ? "Guardar rutina" : "Guardar cambios"}</Button></div>}
        </div>

        <aside className="routine-preview">
          <Card className="card-soft">
            <p className="card-kicker">Vista previa</p>
            <h2>{items.length} ejercicios</h2>
            <p className="muted">{items.length ? "La estructura está completa y lista para entrenar." : "Puede guardarse como borrador, pero aún no está lista para entrenar."}</p>
            <ol className="preview-list">
              {items.map((item) => <li key={item.id}><span>{exerciseById(item.exerciseId)?.name ?? "Ejercicio archivado"}</span><small>{item.targetSets} series · {describeRange(item.repMin, item.repMax)}</small></li>)}
            </ol>
          </Card>
        </aside>
      </form>

      <Dialog open={selectorOpen} title="Añadir ejercicio" description="El mismo ejercicio solo puede aparecer una vez." onClose={() => setSelectorOpen(false)}>
        <div className="selector-search"><Search size={17} aria-hidden="true" /><Input data-dialog-autofocus aria-label="Buscar en el selector" value={selectorSearch} onChange={(event) => setSelectorSearch(event.target.value)} placeholder="Buscar ejercicio" /></div>
        <div className="selector-list">
          {availableExercises.map((exercise) => {
            const added = items.some((item) => item.exerciseId === exercise.id);
            return <div className="selector-row" key={exercise.id}><div><strong>{exercise.name}</strong><small>{exercise.isSystem ? "Sistema" : "Personalizado"}</small></div><Button type="button" variant={added ? "quiet" : "primary"} disabled={added} onClick={() => addExercise(exercise)}>{added ? "Añadido" : "Añadir"}</Button></div>;
          })}
          {!availableExercises.length && <p className="muted">No hay ejercicios que coincidan.</p>}
        </div>
        <div className="dialog-footer"><Link className="text-link" to="/app/exercises" onClick={() => setSelectorOpen(false)}>Crear un ejercicio personalizado</Link><Button type="button" variant="quiet" onClick={() => setSelectorOpen(false)}>Listo</Button></div>
      </Dialog>
    </main>
  );
}
