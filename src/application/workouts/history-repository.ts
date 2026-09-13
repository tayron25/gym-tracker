import type { ExerciseHistoryEntry, WorkoutHistoryPage } from "../../domain/types/history";
import type { PreviousExerciseSession, Workout } from "../../domain/types/workout";

export interface HistoryRepository {
  listWorkouts(page: number, pageSize: number): Promise<WorkoutHistoryPage>;
  getWorkoutDetail(workoutId: string): Promise<Workout>;
  updateNotes(workoutId: string, notes: string): Promise<Workout>;
  deleteWorkout(workoutId: string): Promise<void>;
  getExerciseHistory(exerciseId: string): Promise<ExerciseHistoryEntry[]>;
  getPreviousExerciseSession(exerciseId: string, before?: string): Promise<PreviousExerciseSession | null>;
}
