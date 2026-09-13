import { createContext, useContext, type PropsWithChildren } from "react";
import type { TrainingRepositories } from "../../application/training-repositories";

const TrainingDataContext = createContext<TrainingRepositories | undefined>(undefined);

export function TrainingDataProvider({
  children,
  repositories,
}: PropsWithChildren<{ repositories: TrainingRepositories }>) {
  return <TrainingDataContext.Provider value={repositories}>{children}</TrainingDataContext.Provider>;
}

export function useTrainingRepositories() {
  const context = useContext(TrainingDataContext);
  if (!context) throw new Error("useTrainingRepositories debe usarse dentro de TrainingDataProvider");
  return context;
}
