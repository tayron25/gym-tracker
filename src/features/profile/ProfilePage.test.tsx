import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProfilePage } from "./ProfilePage";
import { AuthProvider } from "../../app/providers/AuthProvider";
import { createMockAuthRepository } from "../../infrastructure/repositories/mock/mock-auth-repository";

describe("perfil simulado", () => {
  it("actualiza preferencias sin ofrecer eliminación de cuenta", async () => {
    const user = userEvent.setup();
    const repository = createMockAuthRepository();
    sessionStorage.setItem("gym-tracker.mock-session", "active");

    render(
      <MemoryRouter>
        <AuthProvider repository={repository}>
          <ProfilePage />
        </AuthProvider>
      </MemoryRouter>,
    );

    const name = await screen.findByLabelText("Nombre visible");
    await user.clear(name);
    await user.type(name, "Tayron nuevo");
    await user.selectOptions(screen.getByLabelText("Unidad de presentación"), "lb");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("Cambios guardados en la sesión simulada.")).toBeInTheDocument();
    expect(screen.queryByText(/eliminar cuenta/i)).not.toBeInTheDocument();
    expect((await repository.getProfile()).weightUnit).toBe("lb");
  });
});
