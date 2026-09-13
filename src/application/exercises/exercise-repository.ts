import type {
  Exercise,
  ExerciseInput,
  MuscleGroup,
  ExerciseFilters,
} from "../../domain/types/exercise";

export interface ExerciseRepository {
  list(filters: ExerciseFilters): Promise<Exercise[]>;
  listMuscleGroups(): Promise<MuscleGroup[]>;
  getById(id: string): Promise<Exercise>;
  createCustom(input: ExerciseInput): Promise<Exercise>;
  updateCustom(id: string, input: ExerciseInput): Promise<Exercise>;
  archive(id: string): Promise<Exercise>;
  restore(id: string): Promise<Exercise>;
}
