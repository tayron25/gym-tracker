import type { ExerciseRepository } from "./exercises/exercise-repository";
import type { RoutineRepository } from "./routines/routine-repository";

export type TrainingRepositories = {
  exercises: ExerciseRepository;
  routines: RoutineRepository;
};
