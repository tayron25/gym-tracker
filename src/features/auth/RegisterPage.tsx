import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { AuthRepositoryError } from "../../application/auth/auth-repository";
import { Button } from "../../components/ui/Button";
import { FieldError } from "../../components/ui/FieldError";
import { Input } from "../../components/ui/Input";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { useAuth } from "../../app/providers/AuthProvider";
import { AuthLayout } from "./AuthLayout";

const registerSchema = z
  .object({
    email: z.string().trim().email("Escribe un correo válido."),
    password: z.string().min(8, "Usa al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Repite tu contraseña."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { signUp } = useAuth();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    resetField,
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await signUp({ email: values.email, password: values.password });
      setPendingEmail(result.email);
    } catch (error) {
      resetField("password");
      resetField("confirmPassword");
      setSubmitError(
        error instanceof AuthRepositoryError && error.code === "EMAIL_ALREADY_REGISTERED"
          ? "No pudimos crear la cuenta con esos datos. Prueba iniciar sesión o recuperar tu contraseña."
          : "No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingEmail) {
    return (
      <AuthLayout
        eyebrow="Cuenta creada"
        title="Confirma tu correo."
        description={`Enviamos un enlace de confirmación a ${pendingEmail}. Cuando lo confirmes, podrás iniciar sesión.`}
        footer={<Link to="/login">Volver al acceso</Link>}
      >
        <StatusBanner variant="success">Revisa tu bandeja de entrada para continuar.</StatusBanner>
        <div className="confirmation-panel">
          <span className="confirmation-mark" aria-hidden="true">✓</span>
          <div>
            <strong>Estado pendiente de confirmación</strong>
            <p>Este prototipo simula el correo; no envía mensajes reales.</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Primer paso"
      title="Crea tu cuenta."
      description="Tus rutinas y workouts quedan preparados para vivir en un espacio privado."
      footer={
        <p className="auth-links">
          <span>¿Ya tienes cuenta?</span>
          <Link to="/login">Iniciar sesión</Link>
        </p>
      }
    >
      {submitError && <StatusBanner variant="error">{submitError}</StatusBanner>}
      <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field-group">
          <label htmlFor="register-email">Correo</label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="register-email-error" message={errors.email?.message} />
        </div>
        <div className="field-group">
          <label htmlFor="register-password">Contraseña</label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "register-password-error" : undefined}
            {...register("password")}
          />
          <FieldError id="register-password-error" message={errors.password?.message} />
        </div>
        <div className="field-group">
          <label htmlFor="register-confirm-password">Repite la contraseña</label>
          <Input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "register-confirm-password-error" : undefined}
            {...register("confirmPassword")}
          />
          <FieldError
            id="register-confirm-password-error"
            message={errors.confirmPassword?.message}
          />
        </div>
        <Button type="submit" loading={isSubmitting} className="button-full">
          Crear cuenta
        </Button>
      </form>
    </AuthLayout>
  );
}

