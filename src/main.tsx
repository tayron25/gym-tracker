import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./app/providers/AppProviders";
import { ErrorBoundary } from "./app/providers/ErrorBoundary";
import { AppRouter } from "./app/router/AppRouter";
import { createMockAuthRepository } from "./infrastructure/repositories/mock/mock-auth-repository";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No se encontró el elemento raíz de la aplicación.");
}

createRoot(root).render(
  <StrictMode>
    <AppProviders repository={createMockAuthRepository()}>
      <ErrorBoundary>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </ErrorBoundary>
    </AppProviders>
  </StrictMode>,
);
