import type { Workout } from "../../domain/types/workout";

export interface WorkoutRepository {
  getActive(): Promise<Workout | null>;
  startFromRoutine(routineId: string): Promise<Workout>;
  addExercise(workoutId: string, exerciseId: string): Promise<Workout>;
  removeExercise(workoutId: string, workoutExerciseId: string): Promise<Workout>;
  reorderExercises(workoutId: string, orderedExerciseIds: string[]): Promise<Workout>;
  complete(workoutId: string): Promise<Workout>;
  cancel(workoutId: string): Promise<Workout>;
}
