import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTrainingRepositories } from "../../app/providers/TrainingDataProvider";
import type { SetInput } from "../../domain/types/workout";

export const workoutKeys = {
  active: ["active-workout"] as const,
  previous: (exerciseId: string) => ["exercise-previous-session", exerciseId] as const,
};

export function useActiveWorkout() {
  const { workouts } = useTrainingRepositories();
  return useQuery({ queryKey: workoutKeys.active, queryFn: () => workouts.getActive() });
}

export function usePreviousExerciseSession(exerciseId: string, before?: string) {
  const { history } = useTrainingRepositories();
  return useQuery({
    queryKey: workoutKeys.previous(exerciseId),
    queryFn: () => history.getPreviousExerciseSession(exerciseId, before),
    enabled: Boolean(exerciseId),
  });
}

export function useWorkoutMutations() {
  const { workouts } = useTrainingRepositories();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: workoutKeys.active });

  return {
    startFromRoutine: useMutation({ mutationFn: (routineId: string) => workouts.startFromRoutine(routineId), onSuccess: refresh }),
    addExercise: useMutation({ mutationFn: ({ workoutId, exerciseId }: { workoutId: string; exerciseId: string }) => workouts.addExercise(workoutId, exerciseId), onSuccess: refresh }),
    removeExercise: useMutation({ mutationFn: ({ workoutId, workoutExerciseId }: { workoutId: string; workoutExerciseId: string }) => workouts.removeExercise(workoutId, workoutExerciseId), onSuccess: refresh }),
    reorderExercises: useMutation({ mutationFn: ({ workoutId, orderedExerciseIds }: { workoutId: string; orderedExerciseIds: string[] }) => workouts.reorderExercises(workoutId, orderedExerciseIds), onSuccess: refresh }),
    complete: useMutation({ mutationFn: (workoutId: string) => workouts.complete(workoutId), onSuccess: refresh }),
    cancel: useMutation({ mutationFn: (workoutId: string) => workouts.cancel(workoutId), onSuccess: refresh }),
  };
}

export function useSetMutations() {
  const { sets } = useTrainingRepositories();
  const queryClient = useQueryClient();
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: workoutKeys.active });
    await queryClient.invalidateQueries({ queryKey: ["exercise-previous-session"] });
  };

  return {
    create: useMutation({ mutationFn: ({ workoutId, workoutExerciseId, input }: { workoutId: string; workoutExerciseId: string; input: SetInput }) => sets.create(workoutId, workoutExerciseId, input), onSuccess: refresh }),
    update: useMutation({ mutationFn: ({ workoutId, setId, input }: { workoutId: string; setId: string; input: SetInput }) => sets.update(workoutId, setId, input), onSuccess: refresh }),
    remove: useMutation({ mutationFn: ({ workoutId, setId }: { workoutId: string; setId: string }) => sets.remove(workoutId, setId), onSuccess: refresh }),
    reorder: useMutation({ mutationFn: ({ workoutId, workoutExerciseId, orderedSetIds }: { workoutId: string; workoutExerciseId: string; orderedSetIds: string[] }) => sets.reorder(workoutId, workoutExerciseId, orderedSetIds), onSuccess: refresh }),
  };
}
