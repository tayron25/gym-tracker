import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppRouter } from "./AppRouter";
import { TestProviders } from "../../test/render";
import { createMockAuthRepository } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { createMockTrainingRepositories } from "../../infrastructure/repositories/mock/mock-training-repositories";

describe("rutas de plantillas", () => {
  it.each([
    ["/app/routines/new", "Nueva rutina."],
    ["/app/routines/routine-push-a", "Push A"],
    ["/app/exercises/exercise-press-banca", "Press banca"],
    ["/app/history", "Historial."],
    ["/app/history/workout-history-push-a", "Push A"],
    ["/app/progress", "Lo que está cambiando."],
  ])("restaura %s directamente dentro de la sesión simulada", async (path, heading) => {
    sessionStorage.setItem("gym-tracker.mock-session", "active");
    render(
      <MemoryRouter initialEntries={[path]}>
        <TestProviders repository={createMockAuthRepository()} trainingRepositories={createMockTrainingRepositories()}>
          <AppRouter />
        </TestProviders>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
  });
});
