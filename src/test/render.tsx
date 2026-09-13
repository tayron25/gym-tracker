import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../app/providers/AuthProvider";
import type { AuthRepository } from "../application/auth/auth-repository";
import type { TrainingRepositories } from "../application/training-repositories";
import { createMockTrainingRepositories } from "../infrastructure/repositories/mock/mock-training-repositories";
import { TrainingDataProvider } from "../app/providers/TrainingDataProvider";

export function TestProviders({
  children,
  repository,
  trainingRepositories = createMockTrainingRepositories(),
}: PropsWithChildren<{ repository: AuthRepository; trainingRepositories?: TrainingRepositories }>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider repository={repository}>
        <TrainingDataProvider repositories={trainingRepositories}>{children}</TrainingDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export function renderWithApp(
  children: React.ReactNode,
  repository: AuthRepository,
  initialEntries = ["/login"],
  trainingRepositories?: TrainingRepositories,
) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <TestProviders repository={repository} trainingRepositories={trainingRepositories}>{children}</TestProviders>
    </MemoryRouter>
  );
}
