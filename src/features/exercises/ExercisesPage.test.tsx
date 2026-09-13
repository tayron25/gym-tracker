import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { createMockAuthRepository } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { createMockTrainingRepositories } from "../../infrastructure/repositories/mock/mock-training-repositories";
import { renderWithApp } from "../../test/render";
import { ExercisesPage } from "./ExercisesPage";

describe("gestión de ejercicios", () => {
  it("busca, limpia filtros y crea un ejercicio disponible de inmediato", async () => {
    const user = userEvent.setup();
    const trainingRepositories = createMockTrainingRepositories();
    render(
      renderWithApp(
        <Routes><Route path="/app/exercises" element={<ExercisesPage />} /></Routes>,
        createMockAuthRepository(),
        ["/app/exercises"],
        trainingRepositories,
      ),
    );

    expect(await screen.findByText("Press banca")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Buscar ejercicios"), "  PRESS BANCA ");
    expect(await screen.findByText("Press banca")).toBeInTheDocument();
    expect(screen.queryByText("Sentadilla")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(await screen.findByText("Sentadilla")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nuevo ejercicio" }));
    await user.type(screen.getByLabelText("Nombre"), "Remo alto propio");
    await user.selectOptions(screen.getByLabelText("Músculo primario"), "2");
    await user.click(screen.getByRole("button", { name: "Crear ejercicio" }));
    expect(await screen.findByText("Remo alto propio")).toBeInTheDocument();
    await expect(trainingRepositories.exercises.getById((await trainingRepositories.exercises.list({ search: "Remo alto", primaryMuscleId: null, equipment: null, includeArchived: false }))[0]!.id)).resolves.toMatchObject({ primaryMuscleId: 2 });
  });

  it("mantiene los ejercicios del sistema como solo lectura", async () => {
    render(
      renderWithApp(
        <Routes><Route path="/app/exercises" element={<ExercisesPage />} /></Routes>,
        createMockAuthRepository(),
        ["/app/exercises"],
        createMockTrainingRepositories(),
      ),
    );
    expect(await screen.findByText("Press banca")).toBeInTheDocument();
    const cards = screen.getAllByText("Sistema").map((label) => label.closest("section"));
    expect(cards[0]).not.toHaveTextContent("Editar");
    expect(cards[0]).not.toHaveTextContent("Archivar");
  });
});
