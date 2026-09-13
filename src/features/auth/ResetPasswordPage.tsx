import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { AuthRepositoryError } from "../../application/auth/auth-repository";
import { Button } from "../../components/ui/Button";
import { FieldError } from "../../components/ui/FieldError";
import { Input } from "../../components/ui/Input";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { useAuth } from "../../app/providers/AuthProvider";
import { AuthLayout } from "./AuthLayout";

const resetSchema = z
  .object({
    password: z.string().min(8, "Usa al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Repite tu contraseña."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [updated, setUpdated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    resetField,
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (values: ResetValues) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await resetPassword(token, values.password);
      setUpdated(true);
    } catch (error) {
      resetField("password");
      resetField("confirmPassword");
      setSubmitError(
        error instanceof AuthRepositoryError && error.code === "RESET_TOKEN_EXPIRED"
          ? "Este enlace venció. Solicita uno nuevo para continuar."
          : "Este enlace no es válido. Solicita uno nuevo para continuar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Nueva contraseña"
      title="Cambia tu acceso."
      description="Elige una contraseña nueva para volver a tus entrenamientos."
      footer={<Link to="/login">Volver al acceso</Link>}
    >
      {updated ? (
        <div className="form-stack">
          <StatusBanner variant="success">Tu contraseña fue actualizada.</StatusBanner>
          <Link className="button button-primary button-full button-link" to="/login">
            Iniciar sesión
          </Link>
        </div>
      ) : (
        <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
          {submitError && <StatusBanner variant="error">{submitError}</StatusBanner>}
          {!token && (
            <StatusBanner variant="error">Falta el enlace de recuperación.</StatusBanner>
          )}
          <div className="field-group">
            <label htmlFor="reset-password">Nueva contraseña</label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "reset-password-error" : undefined}
              {...register("password")}
            />
            <FieldError id="reset-password-error" message={errors.password?.message} />
          </div>
          <div className="field-group">
            <label htmlFor="reset-confirm-password">Repite la contraseña</label>
            <Input
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "reset-confirm-password-error" : undefined}
              {...register("confirmPassword")}
            />
            <FieldError
              id="reset-confirm-password-error"
              message={errors.confirmPassword?.message}
            />
          </div>
          <Button type="submit" loading={isSubmitting} disabled={!token} className="button-full">
            Guardar nueva contraseña
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

