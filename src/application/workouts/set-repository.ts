import type { CompletedSet, SetInput } from "../../domain/types/workout";

export interface SetRepository {
  create(workoutId: string, workoutExerciseId: string, input: SetInput): Promise<CompletedSet>;
  update(workoutId: string, setId: string, input: SetInput): Promise<CompletedSet>;
  remove(workoutId: string, setId: string): Promise<void>;
  reorder(workoutId: string, workoutExerciseId: string, orderedSetIds: string[]): Promise<CompletedSet[]>;
}
