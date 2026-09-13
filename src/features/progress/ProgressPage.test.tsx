import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { createMockAuthRepository } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { createMockTrainingRepositories } from "../../infrastructure/repositories/mock/mock-training-repositories";
import { renderWithApp } from "../../test/render";
import { ProgressPage } from "./ProgressPage";

const renderProgress = () => {
  sessionStorage.setItem("gym-tracker.mock-session", "active");
  return render(renderWithApp(
    <Routes><Route path="/app/progress" element={<ProgressPage />} /></Routes>,
    createMockAuthRepository(),
    ["/app/progress"],
    createMockTrainingRepositories(),
  ));
};

describe("progreso mock", () => {
  it("muestra PR, gráfica equivalente y series semanales", async () => {
    const user = userEvent.setup();
    renderProgress();

    expect(await screen.findByRole("heading", { level: 1, name: "Lo que está cambiando." })).toBeInTheDocument();
    expect(await screen.findByText("Marcas personales")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 2, name: "Series por músculo" })).toBeInTheDocument();
    expect(await screen.findByRole("img", { name: "Gráfica de e1RM estimado" })).toBeInTheDocument();

    await user.click(screen.getByLabelText("6 meses"));
    expect(await screen.findByText("6 meses")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Semana anterior" }));
    expect(screen.getByText(/semana atrás/)).toBeInTheDocument();
  });
});
