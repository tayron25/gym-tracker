import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTrainingRepositories } from "../../app/providers/TrainingDataProvider";
import type { ExerciseFilters, ExerciseInput } from "../../domain/types/exercise";

export const exerciseKeys = {
  all: ["exercises"] as const,
  list: (filters: ExerciseFilters) => ["exercises", "list", filters] as const,
  detail: (id: string) => ["exercises", "detail", id] as const,
  muscles: ["exercises", "muscle-groups"] as const,
};

export function useExercises(filters: ExerciseFilters) {
  const { exercises } = useTrainingRepositories();
  return useQuery({ queryKey: exerciseKeys.list(filters), queryFn: () => exercises.list(filters) });
}

export function useMuscleGroups() {
  const { exercises } = useTrainingRepositories();
  return useQuery({ queryKey: exerciseKeys.muscles, queryFn: () => exercises.listMuscleGroups() });
}

export function useExercise(id: string) {
  const { exercises } = useTrainingRepositories();
  return useQuery({ queryKey: exerciseKeys.detail(id), queryFn: () => exercises.getById(id), enabled: Boolean(id) });
}

export function useExerciseMutations() {
  const { exercises } = useTrainingRepositories();
  const queryClient = useQueryClient();
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    await queryClient.invalidateQueries({ queryKey: ["routines"] });
  };

  return {
    create: useMutation({ mutationFn: (input: ExerciseInput) => exercises.createCustom(input), onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: ExerciseInput }) => exercises.updateCustom(id, input),
      onSuccess: refresh,
    }),
    archive: useMutation({ mutationFn: (id: string) => exercises.archive(id), onSuccess: refresh }),
    restore: useMutation({ mutationFn: (id: string) => exercises.restore(id), onSuccess: refresh }),
  };
}
