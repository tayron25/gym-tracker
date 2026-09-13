export type RoutineExercise = {
  id: string;
  exerciseId: string;
  position: number;
  targetSets: number;
  repMin: number | null;
  repMax: number | null;
  targetRir: number | null;
  restSeconds: number | null;
  notes: string | null;
};

export type Routine = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  items: RoutineExercise[];
};

export type RoutineInput = Pick<Routine, "name" | "description" | "items">;
