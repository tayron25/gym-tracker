import type { Routine, RoutineInput } from "../../domain/types/routine";

export interface RoutineRepository {
  list(includeArchived: boolean): Promise<Routine[]>;
  getById(id: string): Promise<Routine>;
  create(input: RoutineInput): Promise<Routine>;
  update(id: string, input: RoutineInput): Promise<Routine>;
  duplicate(id: string): Promise<Routine>;
  archive(id: string): Promise<Routine>;
  restore(id: string): Promise<Routine>;
  reorder(id: string, orderedItemIds: string[]): Promise<Routine>;
}
