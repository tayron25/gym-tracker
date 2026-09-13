import { beforeEach, describe, expect, it } from "vitest";
import { createMockTrainingRepositories } from "./mock-training-repositories";

describe("repositorios mock de historial y analítica", () => {
  beforeEach(() => sessionStorage.clear());

  it("pagina workouts completados y conserva snapshots en el detalle", async () => {
    const repositories = createMockTrainingRepositories();
    const firstPage = await repositories.history.listWorkouts(1, 5);
    const secondPage = await repositories.history.listWorkouts(2, 5);

    expect(firstPage.total).toBe(6);
    expect(firstPage.items).toHaveLength(5);
    expect(firstPage.hasNextPage).toBe(true);
    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.items[0]?.routineNameSnapshot).toBe("Push A");

    const detail = await repositories.history.getWorkoutDetail(firstPage.items[0]!.id);
    expect(detail.exercises).toHaveLength(5);
    expect(detail.sets.some((set) => set.setType === "warmup")).toBe(true);
    expect(detail.sets.some((set) => set.setType === "approach")).toBe(true);
  });

  it("actualiza notas, elimina el workout y recalcula el total", async () => {
    const repositories = createMockTrainingRepositories();
    const before = await repositories.history.listWorkouts(1, 5);
    const workoutId = before.items[0]!.id;

    await repositories.history.updateNotes(workoutId, "  Nota privada  ");
    await expect(repositories.history.getWorkoutDetail(workoutId)).resolves.toMatchObject({ notes: "Nota privada" });
    await repositories.history.deleteWorkout(workoutId);

    await expect(repositories.history.getWorkoutDetail(workoutId)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(repositories.history.listWorkouts(1, 5)).resolves.toMatchObject({ total: 5 });
  });

  it("calcula PR, tendencia y series semanales sobre datos completados", async () => {
    const repositories = createMockTrainingRepositories();
    const prs = await repositories.analytics.getExercisePRs("exercise-press-banca");
    const trend = await repositories.analytics.getExerciseTrend("exercise-press-banca", "30d");
    const weekly = await repositories.analytics.getWeeklyMuscleSets("2026-09-07", "America/La_Paz");

    expect(prs.weightKg).toBe(80);
    expect(prs.e1rmKg).toBeGreaterThan(100);
    expect(trend.length).toBeGreaterThanOrEqual(5);
    expect(trend.every((point) => point.e1rmKg > 0)).toBe(true);
    expect(weekly.find((muscle) => muscle.muscleName === "Pecho")?.setCount).toBe(6);
  });

  it("mantiene el fallo remoto recuperable sin inventar persistencia", async () => {
    const repositories = createMockTrainingRepositories({ failures: { deleteWorkout: 1 } });
    const page = await repositories.history.listWorkouts(1, 5);
    const workoutId = page.items[0]!.id;

    await expect(repositories.history.deleteWorkout(workoutId)).rejects.toMatchObject({ code: "NETWORK_ERROR" });
    await expect(repositories.history.getWorkoutDetail(workoutId)).resolves.toMatchObject({ id: workoutId });
  });
});
