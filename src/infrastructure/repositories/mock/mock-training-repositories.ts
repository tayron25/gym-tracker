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
import {
  exerciseInputSchema,
  normalizeName,
  routineInputSchema,
} from "../../../domain/validation/training-validation";
import { DEMO_USER_ID } from "./mock-auth-repository";

export const MOCK_TRAINING_DATA_KEY = "gym-tracker.mock-training-data";

type MockTrainingState = {
  version: 1;
  exercises: Exercise[];
  routines: Routine[];
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

const createInitialState = (): MockTrainingState => ({
  version: 1,
  exercises: [
    systemExercise("exercise-press-banca", "Press banca", "barbell", 1, [8, 9]),
    systemExercise("exercise-press-militar", "Press militar", "barbell", 9, [8]),
    systemExercise("exercise-sentadilla", "Sentadilla", "barbell", 3, [4, 5]),
    systemExercise("exercise-peso-muerto", "Peso muerto rumano", "barbell", 4, [5, 2]),
    systemExercise("exercise-dominadas", "Dominadas", "bodyweight", 2, [7]),
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
  ],
  routines: [
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
          id: "routine-item-lateral",
          exerciseId: "exercise-lateral-custom",
          position: 3,
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
  ],
});

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createId = (prefix: string) =>
  `${prefix}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;

const readState = (): MockTrainingState => {
  const stored = sessionStorage.getItem(MOCK_TRAINING_DATA_KEY);
  if (!stored) return createInitialState();

  try {
    const parsed = JSON.parse(stored) as MockTrainingState;
    if (parsed.version === 1 && Array.isArray(parsed.exercises) && Array.isArray(parsed.routines)) {
      return parsed;
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

export const createMockTrainingRepositories = (): TrainingRepositories => {
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

  return { exercises, routines };
};
