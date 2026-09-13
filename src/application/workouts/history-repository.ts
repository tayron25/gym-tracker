import type { PreviousExerciseSession } from "../../domain/types/workout";

export interface HistoryRepository {
  getPreviousExerciseSession(exerciseId: string, before?: string): Promise<PreviousExerciseSession | null>;
}
