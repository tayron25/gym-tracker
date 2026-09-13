import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTrainingRepositories } from "../../app/providers/TrainingDataProvider";
import { HISTORY_PAGE_SIZE } from "../../domain/types/history";

export const historyKeys = {
  all: ["workout-history"] as const,
  list: (page: number) => ["workout-history", page] as const,
  detail: (id: string) => ["workout-history", "detail", id] as const,
  exercise: (id: string) => ["exercise-history", id] as const,
};

export function useWorkoutHistory(page: number) {
  const { history } = useTrainingRepositories();
  return useQuery({
    queryKey: historyKeys.list(page),
    queryFn: () => history.listWorkouts(page, HISTORY_PAGE_SIZE),
  });
}

export function useWorkoutDetail(id: string) {
  const { history } = useTrainingRepositories();
  return useQuery({
    queryKey: historyKeys.detail(id),
    queryFn: () => history.getWorkoutDetail(id),
    enabled: Boolean(id),
  });
}

export function useExerciseHistory(exerciseId: string) {
  const { history } = useTrainingRepositories();
  return useQuery({
    queryKey: historyKeys.exercise(exerciseId),
    queryFn: () => history.getExerciseHistory(exerciseId),
    enabled: Boolean(exerciseId),
  });
}

export function useHistoryMutations() {
  const { history } = useTrainingRepositories();
  const queryClient = useQueryClient();
  const refresh = async (workoutId?: string) => {
    await queryClient.invalidateQueries({ queryKey: historyKeys.all });
    if (workoutId) await queryClient.invalidateQueries({ queryKey: historyKeys.detail(workoutId) });
    await queryClient.invalidateQueries({ queryKey: ["exercise-history"] });
    await queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  return {
    updateNotes: useMutation({
      mutationFn: ({ workoutId, notes }: { workoutId: string; notes: string }) => history.updateNotes(workoutId, notes),
      onSuccess: (_, variables) => refresh(variables.workoutId),
    }),
    deleteWorkout: useMutation({
      mutationFn: (workoutId: string) => history.deleteWorkout(workoutId),
      onSuccess: () => refresh(),
    }),
  };
}
