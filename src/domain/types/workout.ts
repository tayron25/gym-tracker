export type SetType = "warmup" | "approach" | "working";

export type WorkoutStatus = "active" | "completed" | "cancelled";

export type CompletedSet = {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  setType: SetType;
  weightKg: number;
  reps: number;
  rir: number | null;
  completedAt: string;
};

export type SetInput = {
  id?: string;
  setNumber: number;
  setType: SetType;
  weightKg: number;
  reps: number;
  rir: number | null;
};

export type WorkoutExercise = {
  id: string;
  workoutId: string;
  exerciseId: string;
  routineExerciseId: string | null;
  exerciseNameSnapshot: string;
  primaryMuscleIdSnapshot: number;
  position: number;
  targetSetsSnapshot: number | null;
  repMinSnapshot: number | null;
  repMaxSnapshot: number | null;
  targetRirSnapshot: number | null;
  restSecondsSnapshot: number | null;
  notesSnapshot: string | null;
};

export type Workout = {
  id: string;
  userId: string;
  routineId: string | null;
  routineNameSnapshot: string | null;
  startedAt: string;
  finishedAt: string | null;
  status: WorkoutStatus;
  notes: string | null;
  exercises: WorkoutExercise[];
  sets: CompletedSet[];
};

export type PreviousExerciseSession = {
  workoutId: string;
  completedAt: string;
  sets: CompletedSet[];
};
