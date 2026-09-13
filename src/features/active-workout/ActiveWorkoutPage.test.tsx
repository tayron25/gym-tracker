import { render } from "@testing-library/react";
import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { createMockAuthRepository } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { createMockTrainingRepositories } from "../../infrastructure/repositories/mock/mock-training-repositories";
import { renderWithApp } from "../../test/render";
import { ActiveWorkoutPage } from "./ActiveWorkoutPage";

const renderWorkout = (trainingRepositories = createMockTrainingRepositories()) => {
  sessionStorage.setItem("gym-tracker.mock-session", "active");
  return render(
    renderWithApp(
      <Routes>
        <Route path="/app/workout/active" element={<ActiveWorkoutPage />} />
        <Route path="/app" element={<h1>Inicio</h1>} />
      </Routes>,
      createMockAuthRepository(),
      ["/app/workout/active"],
      trainingRepositories,
    ),
  );
};

const choosePush = async (user: ReturnType<typeof userEvent.setup>) => {
  expect(await screen.findByRole("heading", { level: 1, name: "Elige una rutina." })).toBeInTheDocument();
  const pushCard = (await screen.findByRole("heading", { level: 2, name: "Push A" })).closest("section");
  expect(pushCard).not.toBeNull();
  await user.click(within(pushCard!).getByRole("button", { name: "Empezar" }));
};

const startPush = async (user: ReturnType<typeof userEvent.setup>) => {
  await choosePush(user);
  expect(await screen.findByRole("heading", { level: 1, name: "Push A" })).toBeInTheDocument();
  expect(screen.getByText("Ejercicio 1 / 5")).toBeInTheDocument();
};

describe("workout activo", () => {
  it("inicia una rutina de cinco ejercicios y confirma una serie con foco útil", async () => {
    const user = userEvent.setup();
    const repositories = createMockTrainingRepositories();
    renderWorkout(repositories);
    await startPush(user);

    await user.type(screen.getByLabelText("Peso de la serie 1"), "80");
    await user.type(screen.getByLabelText("Repeticiones de la serie 1"), "12");
    await user.click(screen.getByRole("button", { name: "Confirmar serie 1" }));

    expect(await screen.findByText("Serie guardada.")).toBeInTheDocument();
    expect(screen.getByLabelText("Peso de la serie 2")).toHaveFocus();
    expect((await repositories.workouts.getActive())?.sets).toHaveLength(1);
  });

  it("completa los cinco ejercicios y muestra el resumen de la sesión", async () => {
    const user = userEvent.setup();
    const repositories = createMockTrainingRepositories();
    renderWorkout(repositories);
    await startPush(user);

    for (let index = 0; index < 5; index += 1) {
      await user.type(screen.getByLabelText("Peso de la serie 1"), "80");
      await user.type(screen.getByLabelText("Repeticiones de la serie 1"), "12");
      await user.click(screen.getByRole("button", { name: "Confirmar serie 1" }));
      expect(await screen.findByText("Serie guardada.")).toBeInTheDocument();
      if (index < 4) {
        await user.click(screen.getByRole("button", { name: "Siguiente ejercicio" }));
        expect(await screen.findByText(`Ejercicio ${index + 2} / 5`)).toBeInTheDocument();
      }
    }

    await user.click(screen.getByRole("button", { name: /Finalizar/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Sesión guardada." })).toBeInTheDocument();
    expect(screen.getByText("5 ejercicios registrados")).toBeInTheDocument();
    expect(await repositories.workouts.getActive()).toBeNull();
  });

  it("conserva los valores visibles cuando la nube simulada falla", async () => {
    const user = userEvent.setup();
    renderWorkout(createMockTrainingRepositories({ failures: { createSet: 1 } }));
    await startPush(user);

    await user.type(screen.getByLabelText("Peso de la serie 1"), "80");
    await user.type(screen.getByLabelText("Repeticiones de la serie 1"), "12");
    await user.click(screen.getByRole("button", { name: "Confirmar serie 1" }));

    expect(await screen.findByText("No se guardó la serie.")).toBeInTheDocument();
    expect(screen.getByLabelText("Peso de la serie 1")).toHaveValue(80);
    expect(screen.getByRole("button", { name: "Reintentar serie 1" })).toBeInTheDocument();
  });

  it("muestra el fallo al iniciar y deja reintentar desde la misma rutina", async () => {
    const user = userEvent.setup();
    const repositories = createMockTrainingRepositories({ failures: { startFromRoutine: 1 } });
    renderWorkout(repositories);
    await choosePush(user);

    expect(await screen.findByText("No pudimos comenzar el workout.")).toBeInTheDocument();
    const pushCard = screen.getByRole("heading", { level: 2, name: "Push A" }).closest("section");
    expect(pushCard).not.toBeNull();
    await user.click(within(pushCard!).getByRole("button", { name: "Empezar" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Push A" })).toBeInTheDocument();
  });

  it("no finaliza sin series y descarta con confirmación", async () => {
    const user = userEvent.setup();
    renderWorkout();
    await startPush(user);

    await user.click(screen.getByRole("button", { name: /Finalizar/ }));
    expect(await screen.findByText("Confirma al menos una serie antes de finalizar.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Descartar" }));
    const dialog = screen.getByRole("dialog", { name: "Descartar workout" });
    expect(within(dialog).getByText(/quedará cancelado/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Descartar workout" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Inicio" })).toBeInTheDocument();
  });
});
