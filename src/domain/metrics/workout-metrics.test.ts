import { describe, expect, it } from "vitest";
import { calculatePersonalRecords, calculateWorkoutSummary } from "./workout-metrics";
import type { Workout } from "../types/workout";

const set = (id: string, setType: "warmup" | "approach" | "working", weightKg: number, reps: number) => ({
  id,
  workoutExerciseId: "exercise",
  setNumber: Number(id.replace("set-", "")),
  setType,
  weightKg,
  reps,
  rir: null,
  completedAt: "2026-09-08T18:00:00.000Z",
});

describe("métricas históricas", () => {
  it("excluye warmup, approach y peso cero del volumen y PR", () => {
    const sets = [set("set-1", "warmup", 80, 12), set("set-2", "approach", 70, 5), set("set-3", "working", 0, 12), set("set-4", "working", 80, 12)];
    const workout: Workout = {
      id: "workout",
      userId: "user",
      routineId: null,
      routineNameSnapshot: "Push A",
      startedAt: "2026-09-08T17:00:00.000Z",
      finishedAt: "2026-09-08T18:00:00.000Z",
      status: "completed",
      notes: null,
      exercises: [{ id: "exercise", workoutId: "workout", exerciseId: "bench", routineExerciseId: null, exerciseNameSnapshot: "Press banca", primaryMuscleIdSnapshot: 1, position: 1, targetSetsSnapshot: 3, repMinSnapshot: 8, repMaxSnapshot: 12, targetRirSnapshot: 2, restSecondsSnapshot: 120, notesSnapshot: null }],
      sets,
    };

    expect(calculateWorkoutSummary(workout).volumeKg).toBe(960);
    expect(calculatePersonalRecords(sets)).toMatchObject({ weightKg: 80, repsAtWeightKg: 12, repsWeightKg: 80, e1rmKg: 112 });
  });
});
