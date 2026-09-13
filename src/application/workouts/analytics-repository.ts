import type {
  ExercisePersonalRecords,
  ExerciseTrendPoint,
  ProgressRange,
  WeeklyMuscleSets,
} from "../../domain/types/analytics";

export interface AnalyticsRepository {
  getExercisePRs(exerciseId: string): Promise<ExercisePersonalRecords>;
  getExerciseTrend(exerciseId: string, range: ProgressRange): Promise<ExerciseTrendPoint[]>;
  getWeeklyMuscleSets(weekStart: string, timezone: string): Promise<WeeklyMuscleSets[]>;
}
