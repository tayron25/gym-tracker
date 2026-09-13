import { render } from "@testing-library/react";
import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { createMockAuthRepository } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { createMockTrainingRepositories } from "../../infrastructure/repositories/mock/mock-training-repositories";
import { renderWithApp } from "../../test/render";
import { RoutineEditorPage } from "./RoutineEditorPage";
import { RoutinesPage } from "./RoutinesPage";

describe("gestión de rutinas", () => {
  it("crea una rutina, evita ejercicios duplicados y conserva el orden explícito", async () => {
    const user = userEvent.setup();
    const repositories = createMockTrainingRepositories();
    render(
      renderWithApp(
        <Routes>
          <Route path="/app/routines/new" element={<RoutineEditorPage />} />
          <Route path="/app/routines/:id" element={<RoutineEditorPage />} />
        </Routes>,
        createMockAuthRepository(),
        ["/app/routines/new"],
        repositories,
      ),
    );

    await user.type(screen.getByLabelText("Nombre"), "Full body");
    await user.click(screen.getByRole("button", { name: "Añadir ejercicio" }));
    const pressRow = (await screen.findByText("Press banca")).closest<HTMLElement>(".selector-row")!;
    await user.click(within(pressRow).getByRole("button", { name: "Añadir" }));
    expect(within(pressRow).getByRole("button", { name: "Añadido" })).toBeDisabled();
    const squatRow = screen.getByText("Sentadilla").closest<HTMLElement>(".selector-row")!;
    await user.click(within(squatRow).getByRole("button", { name: "Añadir" }));
    const militaryRow = screen.getByText("Press militar").closest<HTMLElement>(".selector-row")!;
    await user.click(within(militaryRow).getByRole("button", { name: "Añadir" }));
    await user.click(screen.getByRole("button", { name: "Listo" }));

    await user.click(screen.getByRole("button", { name: "Bajar Press banca" }));
    await user.click(screen.getByRole("button", { name: "Quitar Press banca" }));
    await user.click(screen.getByRole("button", { name: "Guardar rutina" }));
    expect(await screen.findByText(/Rutina guardada/)).toBeInTheDocument();
    const saved = (await repositories.routines.list(false)).find((routine) => routine.name === "Full body");
    expect(saved?.items.map((item) => item.exerciseId)).toEqual(["exercise-sentadilla", "exercise-press-militar"]);
    expect(saved?.items.map((item) => item.position)).toEqual([1, 2]);
  });

  it("duplica y archiva sin afectar la copia", async () => {
    const user = userEvent.setup();
    const repositories = createMockTrainingRepositories();
    render(
      renderWithApp(
        <Routes><Route path="/app/routines" element={<RoutinesPage />} /></Routes>,
        createMockAuthRepository(),
        ["/app/routines"],
        repositories,
      ),
    );

    const pushCard = (await screen.findByText("Push A")).closest<HTMLElement>("section")!;
    await user.click(within(pushCard).getByRole("button", { name: "Duplicar" }));
    expect(await screen.findByText("Push A (copia)")).toBeInTheDocument();
    await user.click(within(pushCard).getByRole("button", { name: "Archivar" }));
    expect(await screen.findByText(/Rutina archivada/)).toBeInTheDocument();
    expect(screen.getByText("Push A (copia)")).toBeInTheDocument();
  });
});
