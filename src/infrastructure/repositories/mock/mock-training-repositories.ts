import type { TrainingRepositories } from "../../../application/training-repositories";
import { RepositoryError } from "../../../application/shared/repository-error";
import type {
  EquipmentType,
  Exercise,
  ExerciseFilters,
  ExerciseInput,
  MuscleGroup,
} from "../../../domain/types/exercise";
import type { Routine, RoutineInput } from "../../../domain/types/routine";
import type {
  CompletedSet,
  PreviousExerciseSession,
  SetInput,
  Workout,
  WorkoutExercise,
} from "../../../domain/types/workout";
import {
  exerciseInputSchema,
  normalizeName,
  routineInputSchema,
} from "../../../domain/validation/training-validation";
import { setInputSchema } from "../../../domain/validation/workout-validation";
import { DEMO_USER_ID } from "./mock-auth-repository";

export const MOCK_TRAINING_DATA_KEY = "gym-tracker.mock-training-data";

export type MockOperation = "startFromRoutine" | "createSet";

export type MockTrainingOptions = {
  latencyMs?: number;
  failures?: Partial<Record<MockOperation, number>>;
};

type MockTrainingState = {
  version: 2;
  exercises: Exercise[];
  routines: Routine[];
  workouts: Workout[];
};

const muscleGroups: MuscleGroup[] = [
  { id: 1, name: "Pecho", slug: "pecho", sortOrder: 1 },
  { id: 2, name: "Espalda", slug: "espalda", sortOrder: 2 },
  { id: 3, name: "Cuádriceps", slug: "cuadriceps", sortOrder: 3 },
  { id: 4, name: "Isquiosurales", slug: "isquiosurales", sortOrder: 4 },
  { id: 5, name: "Glúteos", slug: "gluteos", sortOrder: 5 },
  { id: 6, name: "Pantorrillas", slug: "pantorrillas", sortOrder: 6 },
  { id: 7, name: "Bíceps", slug: "biceps", sortOrder: 7 },
  { id: 8, name: "Tríceps", slug: "triceps", sortOrder: 8 },
  { id: 9, name: "Deltoide anterior", slug: "deltoide-anterior", sortOrder: 9 },
  { id: 10, name: "Deltoide lateral", slug: "deltoide-lateral", sortOrder: 10 },
  { id: 11, name: "Deltoide posterior", slug: "deltoide-posterior", sortOrder: 11 },
  { id: 12, name: "Abdominales", slug: "abdominales", sortOrder: 12 },
];

const systemExercise = (
  id: string,
  name: string,
  equipment: EquipmentType,
  primaryMuscleId: number,
  secondaryMuscleIds: number[],
): Exercise => ({
  id,
  userId: null,
  name,
  normalizedName: normalizeName(name),
  equipment,
  movementType: "compound",
  isUnilateral: false,
  isSystem: true,
  isArchived: false,
  primaryMuscleId,
  secondaryMuscleIds,
  notes: null,
});

const createInitialState = (): MockTrainingState => {
  const exercises: Exercise[] = [
    systemExercise("exercise-press-banca", "Press banca", "barbell", 1, [8, 9]),
    systemExercise("exercise-press-militar", "Press militar", "barbell", 9, [8]),
    systemExercise("exercise-sentadilla", "Sentadilla", "barbell", 3, [4, 5]),
    systemExercise("exercise-peso-muerto", "Peso muerto rumano", "barbell", 4, [5, 2]),
    systemExercise("exercise-dominadas", "Dominadas", "bodyweight", 2, [7]),
    systemExercise("exercise-aperturas", "Aperturas con mancuernas", "dumbbell", 1, []),
    systemExercise("exercise-triceps-polea", "Extensión de tríceps en polea", "cable", 8, []),
    {
      id: "exercise-lateral-custom",
      userId: DEMO_USER_ID,
      name: "Elevación lateral en cable",
      normalizedName: normalizeName("Elevación lateral en cable"),
      equipment: "cable",
      movementType: "isolation",
      isUnilateral: true,
      isSystem: false,
      isArchived: false,
      primaryMuscleId: 10,
      secondaryMuscleIds: [],
      notes: "Mantener tensión continua.",
    },
    {
      id: "exercise-curl-archived",
      userId: DEMO_USER_ID,
      name: "Curl inclinado",
      normalizedName: normalizeName("Curl inclinado"),
      equipment: "dumbbell",
      movementType: "isolation",
      isUnilateral: false,
      isSystem: false,
      isArchived: true,
      primaryMuscleId: 7,
      secondaryMuscleIds: [],
      notes: null,
    },
  ];
  const routines: Routine[] = [
    {
      id: "routine-push-a",
      userId: DEMO_USER_ID,
      name: "Push A",
      description: "Empuje horizontal y vertical con técnica controlada.",
      isArchived: false,
      items: [
        {
          id: "routine-item-bench",
          exerciseId: "exercise-press-banca",
          position: 1,
          targetSets: 3,
          repMin: 8,
          repMax: 12,
          targetRir: 2,
          restSeconds: 120,
          notes: null,
        },
        {
          id: "routine-item-ohp",
          exerciseId: "exercise-press-militar",
          position: 2,
          targetSets: 3,
          repMin: 8,
          repMax: 10,
          targetRir: 2,
          restSeconds: 90,
          notes: null,
        },
        {
          id: "routine-item-aperturas",
          exerciseId: "exercise-aperturas",
          position: 3,
          targetSets: 3,
          repMin: 10,
          repMax: 12,
          targetRir: 2,
          restSeconds: 75,
          notes: null,
        },
        {
          id: "routine-item-triceps",
          exerciseId: "exercise-triceps-polea",
          position: 4,
          targetSets: 3,
          repMin: 10,
          repMax: 15,
          targetRir: 2,
          restSeconds: 60,
          notes: null,
        },
        {
          id: "routine-item-lateral",
          exerciseId: "exercise-lateral-custom",
          position: 5,
          targetSets: 3,
          repMin: 12,
          repMax: 15,
          targetRir: 2,
          restSeconds: 60,
          notes: "Sin impulso.",
        },
      ],
    },
    {
      id: "routine-legs-a",
      userId: DEMO_USER_ID,
      name: "Legs A",
      description: "Base de tren inferior.",
      isArchived: false,
      items: [
        {
          id: "routine-item-squat",
          exerciseId: "exercise-sentadilla",
          position: 1,
          targetSets: 4,
          repMin: 6,
          repMax: 8,
          targetRir: 2,
          restSeconds: 150,
          notes: null,
        },
      ],
    },
  ];
  const pushRoutine = routines.find((routine) => routine.id === "routine-push-a")!;
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const seedWorkoutId = "workout-history-push-a";
  const seedExercises: WorkoutExercise[] = pushRoutine.items.map((item) => {
    const exercise = exerciseById.get(item.exerciseId)!;
    return {
      id: `workout-exercise-history-${item.position}`,
      workoutId: seedWorkoutId,
      exerciseId: exercise.id,
      routineExerciseId: item.id,
      exerciseNameSnapshot: exercise.name,
      primaryMuscleIdSnapshot: exercise.primaryMuscleId,
      position: item.position,
      targetSetsSnapshot: item.targetSets,
      repMinSnapshot: item.repMin,
      repMaxSnapshot: item.repMax,
      targetRirSnapshot: item.targetRir,
      restSecondsSnapshot: item.restSeconds,
      notesSnapshot: item.notes,
    };
  });
  const seedWeights = [75, 42.5, 12, 25, 10];
  const seedSets: CompletedSet[] = seedExercises.map((exercise, index) => ({
    id: `set-history-${index + 1}`,
    workoutExerciseId: exercise.id,
    setNumber: 1,
    setType: "working",
    weightKg: seedWeights[index] ?? 10,
    reps: 10,
    rir: 2,
    completedAt: `2026-09-08T18:${String(10 + index).padStart(2, "0")}:00.000Z`,
  }));

  return {
    version: 2,
    exercises,
    routines,
    workouts: [{
      id: seedWorkoutId,
      userId: DEMO_USER_ID,
      routineId: pushRoutine.id,
      routineNameSnapshot: pushRoutine.name,
      startedAt: "2026-09-08T18:00:00.000Z",
      finishedAt: "2026-09-08T18:45:00.000Z",
      status: "completed",
      notes: null,
      exercises: seedExercises,
      sets: seedSets,
    }],
  };
};

const migrateV1State = (parsed: { exercises: Exercise[]; routines: Routine[] }): MockTrainingState => {
  const initialState = createInitialState();
  const exercises = [...parsed.exercises];

  initialState.exercises.forEach((exercise) => {
    if (!exercises.some((candidate) => candidate.id === exercise.id)) exercises.push(exercise);
  });

  const routines = parsed.routines.map((routine) => {
    if (routine.id !== "routine-push-a") return routine;
    const initialRoutine = initialState.routines.find((candidate) => candidate.id === routine.id);
    const missingItems = initialRoutine?.items.filter((item) => !routine.items.some((candidate) => candidate.exerciseId === item.exerciseId)) ?? [];
    if (!missingItems.length) return routine;
    const nextPosition = Math.max(0, ...routine.items.map((item) => item.position)) + 1;
    return {
      ...routine,
      items: [...routine.items, ...missingItems.map((item, index) => ({ ...item, position: nextPosition + index }))],
    };
  });

  return { version: 2, exercises, routines, workouts: initialState.workouts };
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createId = (prefix: string) =>
  `${prefix}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;

const readState = (): MockTrainingState => {
  const stored = sessionStorage.getItem(MOCK_TRAINING_DATA_KEY);
  if (!stored) return createInitialState();

  try {
    const parsed = JSON.parse(stored) as { version?: number; exercises?: Exercise[]; routines?: Routine[]; workouts?: Workout[] };
    if (parsed.version === 2 && Array.isArray(parsed.exercises) && Array.isArray(parsed.routines) && Array.isArray(parsed.workouts)) {
      return parsed as MockTrainingState;
    }
    if (parsed.version === 1 && Array.isArray(parsed.exercises) && Array.isArray(parsed.routines)) {
      return migrateV1State({ exercises: parsed.exercises, routines: parsed.routines });
    }
  } catch {
    // Un estado simulado dañado vuelve de forma segura a los fixtures conocidos.
  }

  return createInitialState();
};

const writeState = (state: MockTrainingState) => {
  sessionStorage.setItem(MOCK_TRAINING_DATA_KEY, JSON.stringify(state));
};

const assertExerciseInput = (input: ExerciseInput) => {
  const result = exerciseInputSchema.safeParse(input);
  if (!result.success) {
    throw new RepositoryError("VALIDATION_ERROR", result.error.issues[0]?.message ?? "Ejercicio inválido.");
  }
  return result.data;
};

const assertRoutineInput = (input: RoutineInput) => {
  const result = routineInputSchema.safeParse(input);
  if (!result.success) {
    throw new RepositoryError("VALIDATION_ERROR", result.error.issues[0]?.message ?? "Rutina inválida.");
  }
  return result.data;
};

const assertUniqueExerciseName = (state: MockTrainingState, name: string, exceptId?: string) => {
  const normalizedName = normalizeName(name);
  const duplicate = state.exercises.some(
    (exercise) =>
      exercise.userId === DEMO_USER_ID &&
      exercise.id !== exceptId &&
      exercise.normalizedName === normalizedName,
  );
  if (duplicate) throw new RepositoryError("CONFLICT", "Ya tienes un ejercicio con ese nombre.");
};

const assertUniqueActiveRoutineName = (state: MockTrainingState, name: string, exceptId?: string) => {
  const normalizedName = normalizeName(name);
  const duplicate = state.routines.some(
    (routine) =>
      !routine.isArchived &&
      routine.id !== exceptId &&
      normalizeName(routine.name) === normalizedName,
  );
  if (duplicate) throw new RepositoryError("CONFLICT", "Ya tienes una rutina activa con ese nombre.");
};

const nextCopyName = (state: MockTrainingState, originalName: string) => {
  let suffix = 1;
  let candidate = `${originalName} (copia)`;
  while (state.routines.some((routine) => !routine.isArchived && normalizeName(routine.name) === normalizeName(candidate))) {
    suffix += 1;
    candidate = `${originalName} (copia ${suffix})`;
  }
  return candidate;
};

const assertSetInput = (input: SetInput) => {
  const result = setInputSchema.safeParse(input);
  if (!result.success) {
    throw new RepositoryError("VALIDATION_ERROR", result.error.issues[0]?.message ?? "Serie inválida.");
  }
  return result.data;
};

const getActiveWorkout = (state: MockTrainingState, workoutId?: string) => {
  const workout = state.workouts.find((candidate) =>
    candidate.status === "active" && (!workoutId || candidate.id === workoutId),
  );
  if (!workout) throw new RepositoryError("NOT_FOUND", "El workout activo no está disponible.");
  return workout;
};

const normalizeExercisePositions = (workout: Workout) => {
  workout.exercises = workout.exercises.map((exercise, index) => ({ ...exercise, position: index + 1 }));
};

const normalizeSetPositions = (workout: Workout, workoutExerciseId: string) => {
  const sets = workout.sets
    .filter((set) => set.workoutExerciseId === workoutExerciseId)
    .sort((a, b) => a.setNumber - b.setNumber);
  sets.forEach((set, index) => { set.setNumber = index + 1; });
};

export const createMockTrainingRepositories = (options: MockTrainingOptions = {}): TrainingRepositories => {
  const failureCounts = { ...options.failures };
  const beforeOperation = async (operation: MockOperation) => {
    if (options.latencyMs) await new Promise((resolve) => window.setTimeout(resolve, options.latencyMs));
    if ((failureCounts[operation] ?? 0) > 0) {
      failureCounts[operation] = (failureCounts[operation] ?? 1) - 1;
      throw new RepositoryError("NETWORK_ERROR", "No hubo respuesta confiable del servicio simulado.");
    }
  };

  const exercises: TrainingRepositories["exercises"] = {
    async list(filters: ExerciseFilters) {
      const state = readState();
      const search = normalizeName(filters.search);
      return clone(
        state.exercises
          .filter((exercise) => filters.includeArchived || !exercise.isArchived)
          .filter((exercise) => !search || exercise.normalizedName.includes(search))
          .filter((exercise) => filters.primaryMuscleId === null || exercise.primaryMuscleId === filters.primaryMuscleId)
          .filter((exercise) => filters.equipment === null || exercise.equipment === filters.equipment)
          .sort((a, b) => a.name.localeCompare(b.name, "es")),
      );
    },

    async listMuscleGroups() {
      return clone(muscleGroups);
    },

    async getById(id: string) {
      const exercise = readState().exercises.find((candidate) => candidate.id === id);
      if (!exercise) throw new RepositoryError("NOT_FOUND", "El ejercicio no está disponible.");
      return clone(exercise);
    },

    async createCustom(rawInput: ExerciseInput) {
      const input = assertExerciseInput(rawInput);
      const state = readState();
      assertUniqueExerciseName(state, input.name);
      const exercise: Exercise = {
        ...input,
        id: createId("exercise"),
        userId: DEMO_USER_ID,
        name: input.name.trim(),
        normalizedName: normalizeName(input.name),
        secondaryMuscleIds: [...new Set(input.secondaryMuscleIds)],
        notes: input.notes || null,
        isSystem: false,
        isArchived: false,
      };
      state.exercises.push(exercise);
      writeState(state);
      return clone(exercise);
    },

    async updateCustom(id: string, rawInput: ExerciseInput) {
      const input = assertExerciseInput(rawInput);
      const state = readState();
      const index = state.exercises.findIndex((exercise) => exercise.id === id);
      if (index < 0) throw new RepositoryError("NOT_FOUND", "El ejercicio no está disponible.");
      if (state.exercises[index]?.isSystem) {
        throw new RepositoryError("FORBIDDEN", "Los ejercicios del sistema son de solo lectura.");
      }
      assertUniqueExerciseName(state, input.name, id);
      const updated: Exercise = {
        ...state.exercises[index]!,
        ...input,
        name: input.name.trim(),
        normalizedName: normalizeName(input.name),
        secondaryMuscleIds: [...new Set(input.secondaryMuscleIds)],
        notes: input.notes || null,
      };
      state.exercises[index] = updated;
      writeState(state);
      return clone(updated);
    },

    async archive(id: string) {
      const state = readState();
      const exercise = state.exercises.find((candidate) => candidate.id === id);
      if (!exercise) throw new RepositoryError("NOT_FOUND", "El ejercicio no está disponible.");
      if (exercise.isSystem) throw new RepositoryError("FORBIDDEN", "Los ejercicios del sistema no pueden archivarse.");
      exercise.isArchived = true;
      writeState(state);
      return clone(exercise);
    },

    async restore(id: string) {
      const state = readState();
      const exercise = state.exercises.find((candidate) => candidate.id === id);
      if (!exercise) throw new RepositoryError("NOT_FOUND", "El ejercicio no está disponible.");
      if (exercise.isSystem) throw new RepositoryError("FORBIDDEN", "Los ejercicios del sistema no necesitan restaurarse.");
      exercise.isArchived = false;
      writeState(state);
      return clone(exercise);
    },
  };

  const routines: TrainingRepositories["routines"] = {
    async list(includeArchived: boolean) {
      const state = readState();
      return clone(
        state.routines
          .filter((routine) => includeArchived || !routine.isArchived)
          .sort((a, b) => a.name.localeCompare(b.name, "es")),
      );
    },

    async getById(id: string) {
      const routine = readState().routines.find((candidate) => candidate.id === id);
      if (!routine) throw new RepositoryError("NOT_FOUND", "La rutina no está disponible.");
      return clone(routine);
    },

    async create(rawInput: RoutineInput) {
      const input = assertRoutineInput(rawInput);
      const state = readState();
      assertUniqueActiveRoutineName(state, input.name);
      const routine: Routine = {
        ...input,
        id: createId("routine"),
        userId: DEMO_USER_ID,
        name: input.name.trim(),
        description: input.description || null,
        isArchived: false,
        items: input.items.map((item, index) => ({ ...item, id: createId("routine-item"), position: index + 1 })),
      };
      state.routines.push(routine);
      writeState(state);
      return clone(routine);
    },

    async update(id: string, rawInput: RoutineInput) {
      const input = assertRoutineInput(rawInput);
      const state = readState();
      const index = state.routines.findIndex((routine) => routine.id === id);
      if (index < 0) throw new RepositoryError("NOT_FOUND", "La rutina no está disponible.");
      assertUniqueActiveRoutineName(state, input.name, id);
      const updated: Routine = {
        ...state.routines[index]!,
        ...input,
        name: input.name.trim(),
        description: input.description || null,
        items: input.items.map((item, itemIndex) => ({ ...item, position: itemIndex + 1 })),
      };
      state.routines[index] = updated;
      writeState(state);
      return clone(updated);
    },

    async duplicate(id: string) {
      const state = readState();
      const source = state.routines.find((routine) => routine.id === id);
      if (!source) throw new RepositoryError("NOT_FOUND", "La rutina no está disponible.");
      const copy: Routine = {
        ...source,
        id: createId("routine"),
        name: nextCopyName(state, source.name),
        isArchived: false,
        items: source.items.map((item) => ({ ...item, id: createId("routine-item") })),
      };
      state.routines.push(copy);
      writeState(state);
      return clone(copy);
    },

    async archive(id: string) {
      const state = readState();
      const routine = state.routines.find((candidate) => candidate.id === id);
      if (!routine) throw new RepositoryError("NOT_FOUND", "La rutina no está disponible.");
      routine.isArchived = true;
      writeState(state);
      return clone(routine);
    },

    async restore(id: string) {
      const state = readState();
      const routine = state.routines.find((candidate) => candidate.id === id);
      if (!routine) throw new RepositoryError("NOT_FOUND", "La rutina no está disponible.");
      assertUniqueActiveRoutineName(state, routine.name, id);
      routine.isArchived = false;
      writeState(state);
      return clone(routine);
    },

    async reorder(id: string, orderedItemIds: string[]) {
      const state = readState();
      const routine = state.routines.find((candidate) => candidate.id === id);
      if (!routine) throw new RepositoryError("NOT_FOUND", "La rutina no está disponible.");
      if (
        orderedItemIds.length !== routine.items.length ||
        new Set(orderedItemIds).size !== orderedItemIds.length ||
        orderedItemIds.some((itemId) => !routine.items.some((item) => item.id === itemId))
      ) {
        throw new RepositoryError("VALIDATION_ERROR", "El nuevo orden no contiene los ejercicios actuales.");
      }
      routine.items = orderedItemIds.map((itemId, index) => ({
        ...routine.items.find((item) => item.id === itemId)!,
        position: index + 1,
      }));
      writeState(state);
      return clone(routine);
    },
  };

  const workouts: TrainingRepositories["workouts"] = {
    async getActive() {
      const active = readState().workouts.find((workout) => workout.userId === DEMO_USER_ID && workout.status === "active");
      return active ? clone(active) : null;
    },

    async startFromRoutine(routineId: string) {
      await beforeOperation("startFromRoutine");
      const state = readState();
      if (state.workouts.some((workout) => workout.userId === DEMO_USER_ID && workout.status === "active")) {
        throw new RepositoryError("ACTIVE_WORKOUT_EXISTS", "Ya tienes un workout activo.");
      }
      const routine = state.routines.find((candidate) => candidate.id === routineId && !candidate.isArchived);
      if (!routine) throw new RepositoryError("NOT_FOUND", "La rutina no está disponible para comenzar.");
      if (routine.items.length === 0) throw new RepositoryError("VALIDATION_ERROR", "Añade al menos un ejercicio antes de comenzar.");

      const workoutId = createId("workout");
      const exerciseById = new Map(state.exercises.map((exercise) => [exercise.id, exercise]));
      const workoutExercises = routine.items.map<WorkoutExercise>((item, index) => {
        const exercise = exerciseById.get(item.exerciseId);
        if (!exercise) throw new RepositoryError("NOT_FOUND", "Uno de los ejercicios de la rutina ya no está disponible.");
        return {
          id: createId("workout-exercise"),
          workoutId,
          exerciseId: exercise.id,
          routineExerciseId: item.id,
          exerciseNameSnapshot: exercise.name,
          primaryMuscleIdSnapshot: exercise.primaryMuscleId,
          position: index + 1,
          targetSetsSnapshot: item.targetSets,
          repMinSnapshot: item.repMin,
          repMaxSnapshot: item.repMax,
          targetRirSnapshot: item.targetRir,
          restSecondsSnapshot: item.restSeconds,
          notesSnapshot: item.notes,
        };
      });
      const workout: Workout = {
        id: workoutId,
        userId: DEMO_USER_ID,
        routineId: routine.id,
        routineNameSnapshot: routine.name,
        startedAt: new Date().toISOString(),
        finishedAt: null,
        status: "active",
        notes: null,
        exercises: workoutExercises,
        sets: [],
      };
      state.workouts.push(workout);
      writeState(state);
      return clone(workout);
    },

    async addExercise(workoutId: string, exerciseId: string) {
      const state = readState();
      const workout = getActiveWorkout(state, workoutId);
      if (workout.exercises.some((exercise) => exercise.exerciseId === exerciseId)) {
        throw new RepositoryError("CONFLICT", "Este ejercicio ya está en la sesión.");
      }
      const exercise = state.exercises.find((candidate) => candidate.id === exerciseId && !candidate.isArchived);
      if (!exercise) throw new RepositoryError("NOT_FOUND", "El ejercicio no está disponible para la sesión.");
      workout.exercises.push({
        id: createId("workout-exercise"),
        workoutId,
        exerciseId: exercise.id,
        routineExerciseId: null,
        exerciseNameSnapshot: exercise.name,
        primaryMuscleIdSnapshot: exercise.primaryMuscleId,
        position: workout.exercises.length + 1,
        targetSetsSnapshot: 1,
        repMinSnapshot: null,
        repMaxSnapshot: null,
        targetRirSnapshot: null,
        restSecondsSnapshot: 60,
        notesSnapshot: null,
      });
      writeState(state);
      return clone(workout);
    },

    async removeExercise(workoutId: string, workoutExerciseId: string) {
      const state = readState();
      const workout = getActiveWorkout(state, workoutId);
      const index = workout.exercises.findIndex((exercise) => exercise.id === workoutExerciseId);
      if (index < 0) throw new RepositoryError("NOT_FOUND", "El ejercicio no está en la sesión.");
      workout.exercises.splice(index, 1);
      workout.sets = workout.sets.filter((set) => set.workoutExerciseId !== workoutExerciseId);
      normalizeExercisePositions(workout);
      writeState(state);
      return clone(workout);
    },

    async reorderExercises(workoutId: string, orderedExerciseIds: string[]) {
      const state = readState();
      const workout = getActiveWorkout(state, workoutId);
      if (
        orderedExerciseIds.length !== workout.exercises.length ||
        new Set(orderedExerciseIds).size !== orderedExerciseIds.length ||
        orderedExerciseIds.some((id) => !workout.exercises.some((exercise) => exercise.id === id))
      ) {
        throw new RepositoryError("VALIDATION_ERROR", "El nuevo orden no contiene los ejercicios actuales.");
      }
      workout.exercises = orderedExerciseIds.map((id) => workout.exercises.find((exercise) => exercise.id === id)!);
      normalizeExercisePositions(workout);
      writeState(state);
      return clone(workout);
    },

    async complete(workoutId: string) {
      const state = readState();
      const workout = getActiveWorkout(state, workoutId);
      if (workout.sets.length === 0) throw new RepositoryError("VALIDATION_ERROR", "Confirma al menos una serie antes de finalizar.");
      workout.status = "completed";
      workout.finishedAt = new Date().toISOString();
      writeState(state);
      return clone(workout);
    },

    async cancel(workoutId: string) {
      const state = readState();
      const workout = getActiveWorkout(state, workoutId);
      workout.status = "cancelled";
      workout.finishedAt = new Date().toISOString();
      writeState(state);
      return clone(workout);
    },
  };

  const sets: TrainingRepositories["sets"] = {
    async create(workoutId: string, workoutExerciseId: string, rawInput: SetInput) {
      await beforeOperation("createSet");
      const input = assertSetInput(rawInput);
      const state = readState();
      const workout = getActiveWorkout(state, workoutId);
      if (!workout.exercises.some((exercise) => exercise.id === workoutExerciseId)) {
        throw new RepositoryError("NOT_FOUND", "El ejercicio no está en la sesión.");
      }
      const existingById = input.id ? workout.sets.find((set) => set.id === input.id) : undefined;
      if (existingById) return clone(existingById);
      if (workout.sets.some((set) => set.workoutExerciseId === workoutExerciseId && set.setNumber === input.setNumber)) {
        throw new RepositoryError("CONFLICT", "La serie ya fue confirmada.");
      }
      const completedSet: CompletedSet = {
        id: input.id ?? createId("set"),
        workoutExerciseId,
        setNumber: input.setNumber,
        setType: input.setType,
        weightKg: input.weightKg,
        reps: input.reps,
        rir: input.rir,
        completedAt: new Date().toISOString(),
      };
      workout.sets.push(completedSet);
      writeState(state);
      return clone(completedSet);
    },

    async update(workoutId: string, setId: string, rawInput: SetInput) {
      const input = assertSetInput(rawInput);
      const state = readState();
      const workout = getActiveWorkout(state, workoutId);
      const set = workout.sets.find((candidate) => candidate.id === setId);
      if (!set) throw new RepositoryError("NOT_FOUND", "La serie no está disponible.");
      if (workout.sets.some((candidate) => candidate.id !== setId && candidate.workoutExerciseId === set.workoutExerciseId && candidate.setNumber === input.setNumber)) {
        throw new RepositoryError("CONFLICT", "Ya existe otra serie con ese número.");
      }
      Object.assign(set, {
        setNumber: input.setNumber,
        setType: input.setType,
        weightKg: input.weightKg,
        reps: input.reps,
        rir: input.rir,
      });
      writeState(state);
      return clone(set);
    },

    async remove(workoutId: string, setId: string) {
      const state = readState();
      const workout = getActiveWorkout(state, workoutId);
      const index = workout.sets.findIndex((set) => set.id === setId);
      if (index < 0) throw new RepositoryError("NOT_FOUND", "La serie no está disponible.");
      const workoutExerciseId = workout.sets[index]!.workoutExerciseId;
      workout.sets.splice(index, 1);
      normalizeSetPositions(workout, workoutExerciseId);
      writeState(state);
    },

    async reorder(workoutId: string, workoutExerciseId: string, orderedSetIds: string[]) {
      const state = readState();
      const workout = getActiveWorkout(state, workoutId);
      const current = workout.sets.filter((set) => set.workoutExerciseId === workoutExerciseId);
      if (
        orderedSetIds.length !== current.length ||
        new Set(orderedSetIds).size !== orderedSetIds.length ||
        orderedSetIds.some((id) => !current.some((set) => set.id === id))
      ) {
        throw new RepositoryError("VALIDATION_ERROR", "El nuevo orden no contiene las series actuales.");
      }
      const reordered = orderedSetIds.map((id) => current.find((set) => set.id === id)!);
      reordered.forEach((set, index) => { set.setNumber = index + 1; });
      workout.sets = workout.sets.filter((set) => set.workoutExerciseId !== workoutExerciseId).concat(reordered);
      writeState(state);
      return clone(reordered);
    },
  };

  const history: TrainingRepositories["history"] = {
    async getPreviousExerciseSession(exerciseId: string, before = new Date().toISOString()) {
      const state = readState();
      const previous = state.workouts
        .filter((workout) => workout.userId === DEMO_USER_ID && workout.status === "completed" && workout.finishedAt !== null && workout.finishedAt < before)
        .filter((workout) => workout.exercises.some((exercise) => exercise.exerciseId === exerciseId))
        .sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""))[0];
      if (!previous) return null;
      const exerciseIds = new Set(previous.exercises.filter((exercise) => exercise.exerciseId === exerciseId).map((exercise) => exercise.id));
      const result: PreviousExerciseSession = {
        workoutId: previous.id,
        completedAt: previous.finishedAt!,
        sets: previous.sets.filter((set) => exerciseIds.has(set.workoutExerciseId) && set.setType === "working"),
      };
      return clone(result);
    },
  };

  return { exercises, routines, workouts, sets, history };
};
