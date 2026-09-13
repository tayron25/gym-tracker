import { z } from "zod";

export const normalizeName = (value: string) => value.trim().toLocaleLowerCase("es");

const nullableInteger = (minimum: number, maximum: number, message: string) =>
  z
    .number({ invalid_type_error: message })
    .int(message)
    .min(minimum, message)
    .max(maximum, message)
    .nullable();

export const exerciseInputSchema = z
  .object({
    name: z.string().trim().min(1, "Escribe un nombre.").max(100, "Usa máximo 100 caracteres."),
    equipment: z.enum(["barbell", "dumbbell", "machine", "cable", "bodyweight", "band", "other"]),
    movementType: z.enum(["compound", "isolation"]),
    isUnilateral: z.boolean(),
    primaryMuscleId: z.number().int().positive("Selecciona un músculo primario."),
    secondaryMuscleIds: z.array(z.number().int().positive()),
    notes: z.string().trim().max(1000, "Usa máximo 1000 caracteres.").nullable(),
  })
  .superRefine((value, context) => {
    if (value.secondaryMuscleIds.includes(value.primaryMuscleId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["secondaryMuscleIds"],
        message: "El músculo primario no puede repetirse como secundario.",
      });
    }
  });

export const routineExerciseSchema = z
  .object({
    id: z.string().min(1),
    exerciseId: z.string().min(1),
    position: z.number().int().min(1),
    targetSets: z.number().int().min(1, "Usa entre 1 y 20 series.").max(20, "Usa entre 1 y 20 series."),
    repMin: nullableInteger(1, 100, "Usa entre 1 y 100 repeticiones."),
    repMax: nullableInteger(1, 100, "Usa entre 1 y 100 repeticiones."),
    targetRir: nullableInteger(0, 10, "RIR debe estar entre 0 y 10."),
    restSeconds: nullableInteger(0, 3600, "El descanso debe estar entre 0 y 3600 segundos."),
    notes: z.string().trim().max(1000, "Usa máximo 1000 caracteres.").nullable(),
  })
  .superRefine((value, context) => {
    if (value.repMin !== null && value.repMax !== null && value.repMin > value.repMax) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["repMax"],
        message: "El máximo no puede ser menor que el mínimo.",
      });
    }
  });

export const routineInputSchema = z
  .object({
    name: z.string().trim().min(1, "Escribe un nombre.").max(80, "Usa máximo 80 caracteres."),
    description: z.string().trim().max(1000, "Usa máximo 1000 caracteres.").nullable(),
    items: z.array(routineExerciseSchema),
  })
  .superRefine((value, context) => {
    const exerciseIds = value.items.map((item) => item.exerciseId);
    if (new Set(exerciseIds).size !== exerciseIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: "Un ejercicio no puede aparecer dos veces en la rutina.",
      });
    }

    const positions = value.items.map((item) => item.position);
    const expected = value.items.map((_, index) => index + 1);
    if (positions.some((position, index) => position !== expected[index])) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: "El orden debe ser consecutivo.",
      });
    }
  });

export const isRoutineReady = (name: string, items: unknown[]) => name.trim().length > 0 && items.length > 0;
