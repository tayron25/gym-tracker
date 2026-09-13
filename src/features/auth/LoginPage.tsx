import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthRepositoryError } from "../../application/auth/auth-repository";
import { Button } from "../../components/ui/Button";
import { FieldError } from "../../components/ui/FieldError";
import { Input } from "../../components/ui/Input";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { useAuth } from "../../app/providers/AuthProvider";
import { DEMO_CREDENTIALS } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { AuthLayout } from "./AuthLayout";

const loginSchema = z.object({
  email: z.string().trim().email("Escribe un correo válido."),
  password: z.string().min(1, "Escribe tu contraseña."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const {
    formState: { errors },
    handleSubmit,
    register,
    resetField,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: DEMO_CREDENTIALS.email, password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await signIn(values);
      navigate(from && from.startsWith("/app") ? from : "/app", { replace: true });
    } catch (error) {
      resetField("password");
      setSubmitError(
        error instanceof AuthRepositoryError && error.code === "INVALID_CREDENTIALS"
          ? "No pudimos iniciar sesión. Revisa tu correo y contraseña."
          : "No pudimos iniciar sesión. Inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Gym Tracker · Acceso privado"
      title="Vuelve a tu ritmo."
      description="Consulta la última vez y registra la siguiente serie sin perder contexto."
      footer={
        <p className="auth-links">
          <Link to="/register">Crear cuenta</Link>
          <Link to="/forgot-password">Recuperar contraseña</Link>
        </p>
      }
    >
      {submitError && <StatusBanner variant="error">{submitError}</StatusBanner>}
      <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field-group">
          <label htmlFor="login-email">Correo</label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-describedby={errors.email ? "login-email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError id="login-email-error" message={errors.email?.message} />
        </div>
        <div className="field-group">
          <label htmlFor="login-password">Contraseña</label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-describedby={errors.password ? "login-password-error" : undefined}
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <FieldError id="login-password-error" message={errors.password?.message} />
        </div>
        <Button type="submit" loading={isSubmitting} className="button-full">
          Iniciar sesión
        </Button>
      </form>
      <div className="auth-note">
        <strong>Entorno de demostración</strong>
        <span>Correo: {DEMO_CREDENTIALS.email} · Contraseña: {DEMO_CREDENTIALS.password}</span>
        <small>La autenticación real se conectará en un sprint posterior.</small>
      </div>
    </AuthLayout>
  );
}

