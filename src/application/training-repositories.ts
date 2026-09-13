import type { ExerciseRepository } from "./exercises/exercise-repository";
import type { RoutineRepository } from "./routines/routine-repository";
import type { HistoryRepository } from "./workouts/history-repository";
import type { AnalyticsRepository } from "./workouts/analytics-repository";
import type { SetRepository } from "./workouts/set-repository";
import type { WorkoutRepository } from "./workouts/workout-repository";

export type TrainingRepositories = {
  exercises: ExerciseRepository;
  routines: RoutineRepository;
  workouts: WorkoutRepository;
  sets: SetRepository;
  history: HistoryRepository;
  analytics: AnalyticsRepository;
};
