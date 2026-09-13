export type EquipmentType =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "band"
  | "other";

export type MovementType = "compound" | "isolation";

export type MuscleGroup = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
};

export type Exercise = {
  id: string;
  userId: string | null;
  name: string;
  normalizedName: string;
  equipment: EquipmentType;
  movementType: MovementType;
  isUnilateral: boolean;
  isSystem: boolean;
  isArchived: boolean;
  primaryMuscleId: number;
  secondaryMuscleIds: number[];
  notes: string | null;
};

export type ExerciseInput = Pick<
  Exercise,
  | "name"
  | "equipment"
  | "movementType"
  | "isUnilateral"
  | "primaryMuscleId"
  | "secondaryMuscleIds"
  | "notes"
>;

export type ExerciseFilters = {
  search: string;
  primaryMuscleId: number | null;
  equipment: EquipmentType | null;
  includeArchived: boolean;
};

export const equipmentLabels: Record<EquipmentType, string> = {
  barbell: "Barra",
  dumbbell: "Mancuernas",
  machine: "Máquina",
  cable: "Cable",
  bodyweight: "Peso corporal",
  band: "Banda",
  other: "Otro",
};

export const movementLabels: Record<MovementType, string> = {
  compound: "Compuesto",
  isolation: "Aislamiento",
};
