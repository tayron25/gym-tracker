import { render } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";
import { ForgotPasswordPage } from "./ForgotPasswordPage";
import { ResetPasswordPage } from "./ResetPasswordPage";
import { createMockAuthRepository, DEMO_CREDENTIALS, MOCK_EXPIRED_RESET_TOKEN, MOCK_RESET_TOKEN } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { renderWithApp } from "../../test/render";

describe("autenticación simulada", () => {
  it("inicia sesión y navega al destino privado", async () => {
    const user = userEvent.setup();
    const repository = createMockAuthRepository();

    render(
      renderWithApp(
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<p>Inicio privado</p>} />
        </Routes>,
        repository,
      ),
    );

    await user.type(screen.getByLabelText("Contraseña"), DEMO_CREDENTIALS.password);
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("Inicio privado")).toBeInTheDocument();
    expect(sessionStorage.getItem("gym-tracker.mock-session")).toBe("active");
  });

  it("muestra error seguro, conserva el correo y limpia la contraseña", async () => {
    const user = userEvent.setup();
    const repository = createMockAuthRepository();

    render(
      renderWithApp(
        <Routes><Route path="/login" element={<LoginPage />} /></Routes>,
        repository,
      ),
    );

    const email = screen.getByLabelText("Correo");
    const password = screen.getByLabelText("Contraseña");
    await user.clear(email);
    await user.type(email, "alguien@example.com");
    await user.type(password, "incorrecta");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos iniciar sesión. Revisa tu correo y contraseña.",
    );
    expect(email).toHaveValue("alguien@example.com");
    expect(password).toHaveValue("");
  });

  it("crea una cuenta y presenta confirmación pendiente", async () => {
    const user = userEvent.setup();
    const repository = createMockAuthRepository();

    render(
      renderWithApp(
        <Routes><Route path="/register" element={<RegisterPage />} /></Routes>,
        repository,
        ["/register"],
      ),
    );

    await user.type(screen.getByLabelText("Correo"), "nuevo@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "segura123");
    await user.type(screen.getByLabelText("Repite la contraseña"), "segura123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("Estado pendiente de confirmación")).toBeInTheDocument();
    expect(screen.getByText(/nuevo@example.com/)).toBeInTheDocument();
  });

  it("usa un mensaje neutro para recuperación y ofrece el reset simulado", async () => {
    const user = userEvent.setup();
    const repository = createMockAuthRepository();

    render(
      renderWithApp(
        <Routes><Route path="/forgot-password" element={<ForgotPasswordPage />} /></Routes>,
        repository,
        ["/forgot-password"],
      ),
    );

    await user.type(screen.getByLabelText("Correo"), "desconocido@example.com");
    await user.click(screen.getByRole("button", { name: "Enviar instrucciones" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Si la dirección está registrada, recibirás instrucciones",
    );
    expect(screen.getByRole("link", { name: "Abrir enlace simulado" })).toHaveAttribute(
      "href",
      `/reset-password?token=${MOCK_RESET_TOKEN}`,
    );
  });

  it("acepta el token válido y rechaza uno vencido", async () => {
    const user = userEvent.setup();
    const repository = createMockAuthRepository();

    const { unmount } = render(
      renderWithApp(
        <Routes><Route path="/reset-password" element={<ResetPasswordPage />} /></Routes>,
        repository,
        [`/reset-password?token=${MOCK_RESET_TOKEN}`],
      ),
    );

    await user.type(screen.getByLabelText("Nueva contraseña"), "nueva1234");
    await user.type(screen.getByLabelText("Repite la contraseña"), "nueva1234");
    await user.click(screen.getByRole("button", { name: "Guardar nueva contraseña" }));
    expect(await screen.findByText("Tu contraseña fue actualizada.")).toBeInTheDocument();

    unmount();
    render(
      renderWithApp(
        <Routes><Route path="/reset-password" element={<ResetPasswordPage />} /></Routes>,
        repository,
        [`/reset-password?token=${MOCK_EXPIRED_RESET_TOKEN}`],
      ),
    );
    await user.type(screen.getByLabelText("Nueva contraseña"), "nueva1234");
    await user.type(screen.getByLabelText("Repite la contraseña"), "nueva1234");
    await user.click(screen.getByRole("button", { name: "Guardar nueva contraseña" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Este enlace venció");
    });
  });
});
