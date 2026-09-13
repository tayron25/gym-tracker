import type { CompletedSet, Workout } from "./workout";

export const HISTORY_PAGE_SIZE = 5;

export type WorkoutSummary = {
  durationSeconds: number;
  exerciseCount: number;
  completedSets: number;
  workingSets: number;
  reps: number;
  volumeKg: number;
};

export type WorkoutHistoryItem = Workout & {
  summary: WorkoutSummary;
};

export type WorkoutHistoryPage = {
  items: WorkoutHistoryItem[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
};

export type ExerciseHistoryEntry = {
  workoutId: string;
  completedAt: string;
  routineNameSnapshot: string | null;
  exerciseId: string;
  exerciseNameSnapshot: string;
  sets: CompletedSet[];
  bestE1rmKg: number | null;
};
