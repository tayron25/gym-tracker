import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "../../components/ui/Button";
import { FieldError } from "../../components/ui/FieldError";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { Textarea } from "../../components/ui/Textarea";
import {
  equipmentLabels,
  movementLabels,
  type Exercise,
  type ExerciseInput,
  type MuscleGroup,
} from "../../domain/types/exercise";
import { exerciseInputSchema } from "../../domain/validation/training-validation";

type ExerciseFormValues = z.infer<typeof exerciseInputSchema>;

const emptyValues: ExerciseFormValues = {
  name: "",
  equipment: "other",
  movementType: "compound",
  isUnilateral: false,
  primaryMuscleId: 0,
  secondaryMuscleIds: [],
  notes: null,
};

export function ExerciseForm({
  exercise,
  isSubmitting,
  muscles,
  onCancel,
  onSubmit,
  submitError,
}: {
  exercise?: Exercise;
  isSubmitting: boolean;
  muscles: MuscleGroup[];
  onCancel(): void;
  onSubmit(input: ExerciseInput): Promise<void>;
  submitError?: string;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<ExerciseFormValues>({ resolver: zodResolver(exerciseInputSchema), defaultValues: emptyValues });

  useEffect(() => {
    reset(
      exercise
        ? {
            name: exercise.name,
            equipment: exercise.equipment,
            movementType: exercise.movementType,
            isUnilateral: exercise.isUnilateral,
            primaryMuscleId: exercise.primaryMuscleId,
            secondaryMuscleIds: exercise.secondaryMuscleIds,
            notes: exercise.notes,
          }
        : emptyValues,
    );
  }, [exercise, reset]);

  const primaryMuscleId = watch("primaryMuscleId");
  const secondaryMuscleIds = watch("secondaryMuscleIds");

  return (
    <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
      {submitError && <StatusBanner variant="error">{submitError}</StatusBanner>}
      <div className="field-group">
        <label htmlFor="exercise-name">Nombre</label>
        <Input
          id="exercise-name"
          data-dialog-autofocus
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "exercise-name-error" : undefined}
          {...register("name")}
        />
        <FieldError id="exercise-name-error" message={errors.name?.message} />
      </div>
      <div className="form-grid two-columns">
        <div className="field-group">
          <label htmlFor="exercise-primary-muscle">Músculo primario</label>
          <Select
            id="exercise-primary-muscle"
            aria-invalid={Boolean(errors.primaryMuscleId)}
            {...register("primaryMuscleId", { valueAsNumber: true })}
          >
            <option value={0}>Seleccionar</option>
            {muscles.map((muscle) => <option key={muscle.id} value={muscle.id}>{muscle.name}</option>)}
          </Select>
          <FieldError id="exercise-primary-error" message={errors.primaryMuscleId?.message} />
        </div>
        <div className="field-group">
          <label htmlFor="exercise-equipment">Equipo</label>
          <Select id="exercise-equipment" {...register("equipment")}>
            {Object.entries(equipmentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </div>
        <div className="field-group">
          <label htmlFor="exercise-movement">Tipo de movimiento</label>
          <Select id="exercise-movement" {...register("movementType")}>
            {Object.entries(movementLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </div>
        <label className="check-control">
          <input type="checkbox" {...register("isUnilateral")} />
          <span>Movimiento unilateral</span>
        </label>
      </div>
      <fieldset className="check-fieldset">
        <legend>Músculos secundarios</legend>
        <div className="check-grid">
          {muscles.map((muscle) => {
            const checked = secondaryMuscleIds.includes(muscle.id);
            return (
              <label className="check-control" key={muscle.id}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={primaryMuscleId === muscle.id}
                  onChange={() => {
                    const next = checked
                      ? secondaryMuscleIds.filter((id) => id !== muscle.id)
                      : [...secondaryMuscleIds, muscle.id];
                    setValue("secondaryMuscleIds", next, { shouldValidate: true });
                  }}
                />
                <span>{muscle.name}</span>
              </label>
            );
          })}
        </div>
        <FieldError id="exercise-secondary-error" message={errors.secondaryMuscleIds?.message} />
      </fieldset>
      <div className="field-group">
        <label htmlFor="exercise-notes">Notas <span className="muted">(opcional)</span></label>
        <Textarea id="exercise-notes" rows={3} {...register("notes")} />
      </div>
      <div className="form-actions">
        <Button type="button" variant="quiet" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={isSubmitting}>{exercise ? "Guardar cambios" : "Crear ejercicio"}</Button>
      </div>
    </form>
  );
}
