import { beforeEach, describe, expect, it } from "vitest";
import { RepositoryError } from "../../../application/shared/repository-error";
import { createMockTrainingRepositories, MOCK_TRAINING_DATA_KEY } from "./mock-training-repositories";

const customExercise = {
  name: "  Press inclinado propio  ",
  equipment: "dumbbell" as const,
  movementType: "compound" as const,
  isUnilateral: false,
  primaryMuscleId: 1,
  secondaryMuscleIds: [8],
  notes: null,
};

describe("repositorios mock de plantillas", () => {
  beforeEach(() => sessionStorage.clear());

  it("normaliza búsqueda y nombres personalizados duplicados", async () => {
    const { exercises } = createMockTrainingRepositories();
    const matches = await exercises.list({ search: "  PRESS BANCA ", primaryMuscleId: null, equipment: null, includeArchived: false });
    expect(matches.map((exercise) => exercise.name)).toEqual(["Press banca"]);

    const created = await exercises.createCustom(customExercise);
    expect(created.name).toBe("Press inclinado propio");
    await expect(exercises.createCustom({ ...customExercise, name: "press inclinado propio" })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("protege ejercicios del sistema y archiva sin romper rutinas", async () => {
    const { exercises, routines } = createMockTrainingRepositories();
    await expect(exercises.archive("exercise-press-banca")).rejects.toBeInstanceOf(RepositoryError);
    const archived = await exercises.archive("exercise-lateral-custom");
    expect(archived.isArchived).toBe(true);
    expect((await routines.getById("routine-push-a")).items.some((item) => item.exerciseId === archived.id)).toBe(true);
    expect((await exercises.list({ search: "", primaryMuscleId: null, equipment: null, includeArchived: false })).some((exercise) => exercise.id === archived.id)).toBe(false);
    expect((await exercises.restore(archived.id)).isArchived).toBe(false);
  });

  it("guarda borradores, duplica con IDs nuevos y conserva el orden", async () => {
    const { routines } = createMockTrainingRepositories();
    const draft = await routines.create({ name: "Borrador", description: null, items: [] });
    expect(draft.items).toEqual([]);

    const original = await routines.getById("routine-push-a");
    const copy = await routines.duplicate(original.id);
    expect(copy.name).toBe("Push A (copia)");
    expect(copy.id).not.toBe(original.id);
    expect(copy.items.map((item) => item.exerciseId)).toEqual(original.items.map((item) => item.exerciseId));
    expect(copy.items.map((item) => item.id)).not.toEqual(original.items.map((item) => item.id));

    const reordered = await routines.reorder(original.id, original.items.map((item) => item.id).reverse());
    expect(reordered.items.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(reordered.items[0]?.exerciseId).toBe("exercise-lateral-custom");
    await expect(routines.reorder(original.id, [original.items[0]!.id, original.items[0]!.id, original.items[2]!.id]))
      .rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("recupera mutaciones al crear una nueva instancia durante la misma sesión", async () => {
    const first = createMockTrainingRepositories();
    const created = await first.exercises.createCustom(customExercise);
    expect(sessionStorage.getItem(MOCK_TRAINING_DATA_KEY)).toContain(created.id);

    const reloaded = createMockTrainingRepositories();
    await expect(reloaded.exercises.getById(created.id)).resolves.toMatchObject({ name: "Press inclinado propio" });
  });
});
