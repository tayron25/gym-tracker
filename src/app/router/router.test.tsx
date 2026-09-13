import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProtectedRoute } from "./AppRouter";
import { AppShell } from "../../features/shell/AppShell";
import { createMockAuthRepository, DEMO_CREDENTIALS } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { TestProviders } from "../../test/render";

describe("rutas protegidas", () => {
  it("redirige al acceso cuando no existe sesión", async () => {
    render(
      <MemoryRouter initialEntries={["/app"]}>
        <TestProviders repository={createMockAuthRepository()}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<p>Privado</p>} />
            </Route>
            <Route path="/login" element={<p>Acceso</p>} />
          </Routes>
        </TestProviders>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Acceso")).toBeInTheDocument();
    expect(screen.queryByText("Privado")).not.toBeInTheDocument();
  });

  it("restaura una marca de sesión desde sessionStorage", async () => {
    const repository = createMockAuthRepository();
    sessionStorage.setItem("gym-tracker.mock-session", "active");

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <TestProviders repository={repository}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/app" element={<p>Privado restaurado</p>} />
              </Route>
            </Route>
          </Routes>
        </TestProviders>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Privado restaurado")).toBeInTheDocument();
    expect(sessionStorage.getItem("gym-tracker.mock-session")).toBe("active");
  });

  it("el logout elimina la marca de sesión y los datos privados simulados", async () => {
    const user = userEvent.setup();
    const repository = createMockAuthRepository();
    sessionStorage.setItem("gym-tracker.mock-session", "active");
    sessionStorage.setItem("gym-tracker.mock-training-data", "datos privados simulados");

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <TestProviders repository={repository}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/app" element={<p>Privado restaurado</p>} />
              </Route>
            </Route>
            <Route path="/login" element={<p>Acceso después de logout</p>} />
          </Routes>
        </TestProviders>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Privado restaurado")).toBeInTheDocument();
    expect(sessionStorage.getItem("gym-tracker.mock-session")).toBe("active");
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(sessionStorage.getItem("gym-tracker.mock-session")).toBeNull();
    expect(sessionStorage.getItem("gym-tracker.mock-training-data")).toBeNull();
    expect(await screen.findByText("Acceso después de logout")).toBeInTheDocument();
    expect(DEMO_CREDENTIALS.email).toBe("tayron@example.com");
  });
});
