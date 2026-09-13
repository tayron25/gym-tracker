import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";
import type { AuthRepository } from "../../application/auth/auth-repository";
import type { TrainingRepositories } from "../../application/training-repositories";
import { createMockAuthRepository } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { createMockTrainingRepositories } from "../../infrastructure/repositories/mock/mock-training-repositories";
import { AuthProvider } from "./AuthProvider";
import { TrainingDataProvider } from "./TrainingDataProvider";

type AppProvidersProps = PropsWithChildren<{
  repository?: AuthRepository;
  trainingRepositories?: TrainingRepositories;
}>;

export function AppProviders({ children, repository = createMockAuthRepository(), trainingRepositories }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 0 },
          mutations: { retry: false },
        },
      }),
  );
  const [resolvedTrainingRepositories] = useState(
    () => trainingRepositories ?? createMockTrainingRepositories(),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider repository={repository}>
        <TrainingDataProvider repositories={resolvedTrainingRepositories}>
          {children}
        </TrainingDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
