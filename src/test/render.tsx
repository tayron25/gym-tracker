import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../app/providers/AuthProvider";
import type { AuthRepository } from "../application/auth/auth-repository";

export function TestProviders({ children, repository }: PropsWithChildren<{ repository: AuthRepository }>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider repository={repository}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

export function renderWithApp(
  children: React.ReactNode,
  repository: AuthRepository,
  initialEntries = ["/login"],
) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <TestProviders repository={repository}>{children}</TestProviders>
    </MemoryRouter>
  );
}

