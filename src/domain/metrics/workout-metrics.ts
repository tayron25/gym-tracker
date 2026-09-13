import type { CompletedSet, Workout } from "../types/workout";

export const calculateE1rm = (weightKg: number, reps: number): number | null => {
  if (!Number.isFinite(weightKg) || !Number.isFinite(reps) || weightKg <= 0 || reps < 1 || reps > 15) return null;
  return weightKg * (1 + reps / 30);
};

export const eligibleWorkingSets = (sets: CompletedSet[]) =>
  sets.filter((set) => set.setType === "working" && set.weightKg > 0);

export const calculateWorkoutSummary = (workout: Workout, now = Date.now()) => {
  const completedSets = workout.sets.length;
  const workingSets = workout.sets.filter((set) => set.setType === "working");
  const volumeKg = workingSets.reduce((total, set) => total + set.weightKg * set.reps, 0);
  const reps = workout.sets.reduce((total, set) => total + set.reps, 0);
  const end = workout.finishedAt ? Date.parse(workout.finishedAt) : now;
  const started = Date.parse(workout.startedAt);

  return {
    durationSeconds: Math.max(0, Math.floor((end - started) / 1000)),
    exerciseCount: workout.exercises.length,
    completedSets,
    workingSets: workingSets.length,
    reps,
    volumeKg,
  };
};

export const calculateSessionBestE1rm = (sets: CompletedSet[]) =>
  eligibleWorkingSets(sets).reduce<number | null>((best, set) => {
    const e1rm = calculateE1rm(set.weightKg, set.reps);
    return e1rm === null || (best !== null && best >= e1rm) ? best : e1rm;
  }, null);
