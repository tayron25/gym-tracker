import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { FieldError } from "../../components/ui/FieldError";
import { Input } from "../../components/ui/Input";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { useAuth } from "../../app/providers/AuthProvider";
import { MOCK_RESET_TOKEN } from "../../infrastructure/repositories/mock/mock-auth-repository";
import { AuthLayout } from "./AuthLayout";

const forgotSchema = z.object({
  email: z.string().trim().email("Escribe un correo válido."),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (values: ForgotValues) => {
    setIsSubmitting(true);
    await requestPasswordReset(values.email);
    setSent(true);
    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      eyebrow="Recuperación segura"
      title="Vuelve a entrar."
      description="Indica tu correo y te diremos cómo continuar sin revelar si existe una cuenta."
      footer={<Link to="/login">Volver al acceso</Link>}
    >
      {sent ? (
        <div className="form-stack">
          <StatusBanner variant="success">
            Si la dirección está registrada, recibirás instrucciones para recuperar tu cuenta.
          </StatusBanner>
          <div className="auth-note">
            <strong>Enlace de prueba</strong>
            <span>El prototipo permite revisar el flujo de reset sin enviar correo.</span>
            <Link className="text-link" to={`/reset-password?token=${MOCK_RESET_TOKEN}`}>
              Abrir enlace simulado
            </Link>
          </div>
        </div>
      ) : (
        <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field-group">
            <label htmlFor="forgot-email">Correo</label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "forgot-email-error" : undefined}
              {...register("email")}
            />
            <FieldError id="forgot-email-error" message={errors.email?.message} />
          </div>
          <Button type="submit" loading={isSubmitting} className="button-full">
            Enviar instrucciones
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

