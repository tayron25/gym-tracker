export type ProgressRange = "30d" | "6m";

export type ExercisePersonalRecords = {
  weightKg: number | null;
  repsAtWeightKg: number | null;
  repsWeightKg: number | null;
  e1rmKg: number | null;
};

export type ExerciseTrendPoint = {
  workoutId: string;
  completedAt: string;
  routineNameSnapshot: string | null;
  weightKg: number;
  reps: number;
  e1rmKg: number;
};

export type WeeklyMuscleSets = {
  muscleGroupId: number;
  muscleName: string;
  setCount: number;
};
