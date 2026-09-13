import { useQuery } from "@tanstack/react-query";
import { useTrainingRepositories } from "../../app/providers/TrainingDataProvider";
import type { ProgressRange } from "../../domain/types/analytics";

export const analyticsKeys = {
  prs: (exerciseId: string) => ["analytics", "prs", exerciseId] as const,
  trend: (exerciseId: string, range: ProgressRange) => ["analytics", "trend", exerciseId, range] as const,
  weekly: (weekStart: string, timezone: string) => ["analytics", "weekly", weekStart, timezone] as const,
};

export function useExercisePRs(exerciseId: string) {
  const { analytics } = useTrainingRepositories();
  return useQuery({
    queryKey: analyticsKeys.prs(exerciseId),
    queryFn: () => analytics.getExercisePRs(exerciseId),
    enabled: Boolean(exerciseId),
  });
}

export function useExerciseTrend(exerciseId: string, range: ProgressRange) {
  const { analytics } = useTrainingRepositories();
  return useQuery({
    queryKey: analyticsKeys.trend(exerciseId, range),
    queryFn: () => analytics.getExerciseTrend(exerciseId, range),
    enabled: Boolean(exerciseId),
  });
}

export function useWeeklyMuscleSets(weekStart: string, timezone: string) {
  const { analytics } = useTrainingRepositories();
  return useQuery({
    queryKey: analyticsKeys.weekly(weekStart, timezone),
    queryFn: () => analytics.getWeeklyMuscleSets(weekStart, timezone),
    enabled: Boolean(weekStart && timezone),
  });
}
