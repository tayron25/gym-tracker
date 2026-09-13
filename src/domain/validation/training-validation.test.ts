import { describe, expect, it } from "vitest";
import { exerciseInputSchema, isRoutineReady, routineInputSchema } from "./training-validation";

const routineItem = {
  id: "item-1",
  exerciseId: "exercise-1",
  position: 1,
  targetSets: 3,
  repMin: 8,
  repMax: 12,
  targetRir: 2,
  restSeconds: 90,
  notes: null,
};

describe("validaciones de plantillas", () => {
  it("permite guardar una rutina vacía pero la marca como no lista", () => {
    expect(routineInputSchema.safeParse({ name: "Borrador", description: null, items: [] }).success).toBe(true);
    expect(isRoutineReady("Borrador", [])).toBe(false);
    expect(isRoutineReady("", [routineItem])).toBe(false);
    expect(isRoutineReady("Lista", [routineItem])).toBe(true);
  });

  it("rechaza objetivos fuera de RN-023", () => {
    expect(routineInputSchema.safeParse({ name: "Inválida", description: null, items: [{ ...routineItem, targetSets: 21 }] }).success).toBe(false);
    expect(routineInputSchema.safeParse({ name: "Inválida", description: null, items: [{ ...routineItem, repMin: 12, repMax: 8 }] }).success).toBe(false);
    expect(routineInputSchema.safeParse({ name: "Inválida", description: null, items: [{ ...routineItem, targetRir: 11 }] }).success).toBe(false);
    expect(routineInputSchema.safeParse({ name: "Inválida", description: null, items: [{ ...routineItem, restSeconds: 3601 }] }).success).toBe(false);
  });

  it("rechaza ejercicios repetidos y posiciones no consecutivas", () => {
    const duplicate = [{ ...routineItem }, { ...routineItem, id: "item-2", position: 2 }];
    expect(routineInputSchema.safeParse({ name: "Inválida", description: null, items: duplicate }).success).toBe(false);
    expect(routineInputSchema.safeParse({ name: "Inválida", description: null, items: [{ ...routineItem, position: 2 }] }).success).toBe(false);
  });

  it("exige un primario distinto de los músculos secundarios", () => {
    const result = exerciseInputSchema.safeParse({
      name: "Press propio",
      equipment: "barbell",
      movementType: "compound",
      isUnilateral: false,
      primaryMuscleId: 1,
      secondaryMuscleIds: [1, 8],
      notes: null,
    });
    expect(result.success).toBe(false);
  });
});
