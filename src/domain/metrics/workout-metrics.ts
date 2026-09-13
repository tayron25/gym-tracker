import type { ExercisePersonalRecords } from "../types/analytics";
import type { CompletedSet, Workout } from "../types/workout";

export const calculateE1rm = (weightKg: number, reps: number): number | null => {
  if (!Number.isFinite(weightKg) || !Number.isFinite(reps) || weightKg <= 0 || reps < 1 || reps > 15) return null;
  return weightKg * (1 + reps / 30);
};

export const eligibleWorkingSets = (sets: CompletedSet[]) =>
  sets.filter((set) => set.setType === "working" && set.weightKg > 0);

export const eligibleE1rmSets = (sets: CompletedSet[]) =>
  eligibleWorkingSets(sets).filter((set) => calculateE1rm(set.weightKg, set.reps) !== null);

export const calculateWorkoutSummary = (workout: Workout, now = Date.now()) => {
  const completedSets = workout.sets.length;
  const workingSets = workout.sets.filter((set) => set.setType === "working");
  const volumeKg = workingSets
    .filter((set) => set.weightKg > 0)
    .reduce((total, set) => total + set.weightKg * set.reps, 0);
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

export const calculatePersonalRecords = (sets: CompletedSet[]): ExercisePersonalRecords => {
  const eligible = eligibleWorkingSets(sets);
  const bestWeight = eligible.reduce<number | null>((best, set) =>
    best === null || set.weightKg > best ? set.weightKg : best, null);
  const bestRepsSet = eligible.reduce<CompletedSet | null>((best, set) => {
    if (best === null || set.reps > best.reps || (set.reps === best.reps && set.weightKg > best.weightKg)) return set;
    return best;
  }, null);
  const bestE1rm = eligibleE1rmSets(eligible).reduce<number | null>((best, set) => {
    const e1rm = calculateE1rm(set.weightKg, set.reps);
    return e1rm === null || (best !== null && best >= e1rm) ? best : e1rm;
  }, null);

  return {
    weightKg: bestWeight,
    repsAtWeightKg: bestRepsSet?.reps ?? null,
    repsWeightKg: bestRepsSet?.weightKg ?? null,
    e1rmKg: bestE1rm,
  };
};
