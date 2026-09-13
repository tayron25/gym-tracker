import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";
import type { AuthRepository } from "../../application/auth/auth-repository";
import { createMockAuthRepository } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { AuthProvider } from "./AuthProvider";

type AppProvidersProps = PropsWithChildren<{
  repository?: AuthRepository;
}>;

export function AppProviders({ children, repository = createMockAuthRepository() }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 0 },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider repository={repository}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
