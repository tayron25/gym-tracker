import { beforeEach, describe, expect, it } from "vitest";
import { RepositoryError } from "../../../application/shared/repository-error";
import { createMockTrainingRepositories, MOCK_TRAINING_DATA_KEY } from "./mock-training-repositories";

describe("repositorios mock del workout activo", () => {
  beforeEach(() => sessionStorage.clear());

  it("crea cinco snapshots, persiste al recargar y bloquea un segundo activo", async () => {
    const repositories = createMockTrainingRepositories();
    const sourceRoutine = await repositories.routines.getById("routine-push-a");
    const workout = await repositories.workouts.startFromRoutine(sourceRoutine.id);

    expect(workout.exercises).toHaveLength(5);
    expect(workout.exercises.map((exercise) => exercise.position)).toEqual([1, 2, 3, 4, 5]);
    expect((await repositories.routines.getById(sourceRoutine.id)).items).toEqual(sourceRoutine.items);
    await expect(repositories.workouts.startFromRoutine(sourceRoutine.id)).rejects.toMatchObject({ code: "ACTIVE_WORKOUT_EXISTS" });

    const reloaded = createMockTrainingRepositories();
    await expect(reloaded.workouts.getActive()).resolves.toMatchObject({ id: workout.id, exercises: expect.any(Array) });
  });

  it("hace idempotente el alta de una serie con el mismo UUID de cliente", async () => {
    const repositories = createMockTrainingRepositories();
    const workout = await repositories.workouts.startFromRoutine("routine-push-a");
    const exercise = workout.exercises[0]!;
    const input = { id: "client-set-1", setNumber: 1, setType: "working" as const, weightKg: 80, reps: 12, rir: null };

    const [first, retry] = await Promise.all([
      repositories.sets.create(workout.id, exercise.id, input),
      repositories.sets.create(workout.id, exercise.id, input),
    ]);

    expect(first.id).toBe(retry.id);
    expect((await repositories.workouts.getActive())?.sets).toHaveLength(1);
  });

  it("no escribe cuando la operación simulada falla y permite reintentar", async () => {
    const repositories = createMockTrainingRepositories({ failures: { createSet: 1 } });
    const workout = await repositories.workouts.startFromRoutine("routine-push-a");
    const exercise = workout.exercises[0]!;
    const input = { id: "client-set-retry", setNumber: 1, setType: "working" as const, weightKg: 80, reps: 12, rir: null };

    await expect(repositories.sets.create(workout.id, exercise.id, input)).rejects.toMatchObject({ code: "NETWORK_ERROR" });
    expect((await repositories.workouts.getActive())?.sets).toHaveLength(0);
    await expect(repositories.sets.create(workout.id, exercise.id, input)).resolves.toMatchObject({ id: input.id });
    expect(sessionStorage.getItem(MOCK_TRAINING_DATA_KEY)).toContain(input.id);
  });

  it("requiere una serie para finalizar y excluye el workout cancelado del activo", async () => {
    const repositories = createMockTrainingRepositories();
    const workout = await repositories.workouts.startFromRoutine("routine-push-a");
    await expect(repositories.workouts.complete(workout.id)).rejects.toBeInstanceOf(RepositoryError);
    await repositories.workouts.cancel(workout.id);
    await expect(repositories.workouts.getActive()).resolves.toBeNull();
  });
});
