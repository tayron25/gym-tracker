import { render } from "@testing-library/react";
import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { createMockAuthRepository } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { createMockTrainingRepositories } from "../../infrastructure/repositories/mock/mock-training-repositories";
import { renderWithApp } from "../../test/render";
import { HistoryPage } from "./HistoryPage";
import { HistoryDetailPage } from "./HistoryDetailPage";

const renderHistory = (path = "/app/history", trainingRepositories = createMockTrainingRepositories()) => {
  sessionStorage.setItem("gym-tracker.mock-session", "active");
  return render(renderWithApp(
    <Routes>
      <Route path="/app/history" element={<HistoryPage />} />
      <Route path="/app/history/:id" element={<HistoryDetailPage />} />
    </Routes>,
    createMockAuthRepository(),
    [path],
    trainingRepositories,
  ));
};

describe("historial mock", () => {
  it("muestra sesiones descendentes y pagina cinco elementos", async () => {
    const user = userEvent.setup();
    renderHistory();

    expect(await screen.findByRole("heading", { level: 1, name: "Historial." })).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Push A/ })).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: /Página siguiente/ }));

    expect(await screen.findByText("Página 2 de 2")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Push A/ })).toHaveLength(1);
  });

  it("edita la nota y elimina un workout con advertencia", async () => {
    const user = userEvent.setup();
    renderHistory("/app/history/workout-history-push-a");

    expect(await screen.findByRole("heading", { level: 1, name: "Push A" })).toBeInTheDocument();
    const notes = screen.getByLabelText("Nota del workout");
    await user.clear(notes);
    await user.type(notes, "Sesión sólida");
    await user.click(screen.getByRole("button", { name: "Guardar nota" }));
    expect(await screen.findByText("Nota guardada.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    const dialog = screen.getByRole("dialog", { name: "Eliminar workout histórico" });
    expect(within(dialog).getByText(/se recalcularán/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Eliminar workout" }));
    expect(await screen.findByRole("heading", { level: 2, name: "Últimos workouts" })).toBeInTheDocument();
    expect(screen.getByText("5 sesiones · orden descendente")).toBeInTheDocument();
  });

  it("presenta error recuperable y reintenta la carga", async () => {
    const user = userEvent.setup();
    renderHistory("/app/history", createMockTrainingRepositories({ failures: { listWorkouts: 1 } }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos cargar el historial");
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("heading", { level: 2, name: "Últimos workouts" })).toBeInTheDocument();
  });
});
