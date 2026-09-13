import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTrainingRepositories } from "../../app/providers/TrainingDataProvider";
import type { RoutineInput } from "../../domain/types/routine";

export const routineKeys = {
  all: ["routines"] as const,
  list: (includeArchived: boolean) => ["routines", "list", { includeArchived }] as const,
  detail: (id: string) => ["routines", "detail", id] as const,
};

export function useRoutines(includeArchived: boolean) {
  const { routines } = useTrainingRepositories();
  return useQuery({ queryKey: routineKeys.list(includeArchived), queryFn: () => routines.list(includeArchived) });
}

export function useRoutine(id: string) {
  const { routines } = useTrainingRepositories();
  return useQuery({ queryKey: routineKeys.detail(id), queryFn: () => routines.getById(id), enabled: Boolean(id) });
}

export function useRoutineMutations() {
  const { routines } = useTrainingRepositories();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: routineKeys.all });

  return {
    create: useMutation({ mutationFn: (input: RoutineInput) => routines.create(input), onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: RoutineInput }) => routines.update(id, input),
      onSuccess: refresh,
    }),
    duplicate: useMutation({ mutationFn: (id: string) => routines.duplicate(id), onSuccess: refresh }),
    archive: useMutation({ mutationFn: (id: string) => routines.archive(id), onSuccess: refresh }),
    restore: useMutation({ mutationFn: (id: string) => routines.restore(id), onSuccess: refresh }),
  };
}
