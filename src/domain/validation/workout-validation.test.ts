import { describe, expect, it } from "vitest";
import { calculateE1rm, calculateSessionBestE1rm } from "../metrics/workout-metrics";
import { setInputSchema } from "./workout-validation";

describe("reglas del workout activo", () => {
  it("valida peso, reps y RIR y permite peso cero", () => {
    expect(setInputSchema.safeParse({ setNumber: 1, setType: "working", weightKg: 0, reps: 12, rir: null }).success).toBe(true);
    expect(setInputSchema.safeParse({ setNumber: 1, setType: "working", weightKg: -1, reps: 12, rir: null }).success).toBe(false);
    expect(setInputSchema.safeParse({ setNumber: 1, setType: "working", weightKg: 80, reps: 12, rir: 11 }).success).toBe(false);
  });

  it("limita el peso a la precisión canónica de kg", () => {
    expect(setInputSchema.safeParse({ setNumber: 1, setType: "working", weightKg: 80.125, reps: 8, rir: null }).success).toBe(true);
    expect(setInputSchema.safeParse({ setNumber: 1, setType: "working", weightKg: 80.1255, reps: 8, rir: null }).success).toBe(false);
  });

  it("aplica Epley solo cuando la serie es elegible", () => {
    expect(calculateE1rm(80, 12)).toBe(112);
    expect(calculateE1rm(100, 16)).toBeNull();
    expect(calculateE1rm(0, 12)).toBeNull();
    expect(calculateSessionBestE1rm([
      { id: "a", workoutExerciseId: "we", setNumber: 1, setType: "warmup", weightKg: 80, reps: 12, rir: null, completedAt: "2026-09-12T18:00:00.000Z" },
      { id: "b", workoutExerciseId: "we", setNumber: 2, setType: "working", weightKg: 80, reps: 12, rir: null, completedAt: "2026-09-12T18:01:00.000Z" },
    ])).toBe(112);
  });
});
