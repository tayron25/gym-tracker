import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FieldError } from "../../components/ui/FieldError";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { useAuth } from "../../app/providers/AuthProvider";

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Escribe un nombre visible.").max(80, "Usa máximo 80 caracteres."),
  weightUnit: z.enum(["kg", "lb"]),
  timezone: z.string().min(1, "Selecciona una zona horaria."),
  weekStartsOn: z.coerce.number().refine((value): value is 1 | 7 => value === 1 || value === 7, {
    message: "Selecciona lunes o domingo.",
  }),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      weightUnit: "kg",
      timezone: "America/La_Paz",
      weekStartsOn: 1,
    },
  });

  useEffect(() => {
    if (profile) reset(profile);
  }, [profile, reset]);

  const onSubmit = async (values: ProfileValues) => {
    setSaved(false);
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await updateProfile({ ...values, weekStartsOn: values.weekStartsOn as 1 | 7 });
      setSaved(true);
    } catch {
      setSubmitError("No pudimos guardar el perfil. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-content">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Perfil y preferencias</p>
          <h1>Ajustes.</h1>
          <p>Configura cómo se mostrarán tus datos sin cambiar la magnitud histórica guardada en kg.</p>
        </div>
      </header>
      <div className="profile-grid">
        <Card>
          <div className="card-kicker">Identidad</div>
          <h2>Tu perfil</h2>
          <form className="form-stack profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {submitError && <StatusBanner variant="error">{submitError}</StatusBanner>}
            {saved && <StatusBanner variant="success">Cambios guardados en la sesión simulada.</StatusBanner>}
            <div className="field-group">
              <label htmlFor="profile-display-name">Nombre visible</label>
              <Input
                id="profile-display-name"
                autoComplete="name"
                aria-invalid={Boolean(errors.displayName)}
                aria-describedby={errors.displayName ? "profile-display-name-error" : undefined}
                {...register("displayName")}
              />
              <FieldError id="profile-display-name-error" message={errors.displayName?.message} />
            </div>
            <div className="field-group">
              <label htmlFor="profile-weight-unit">Unidad de presentación</label>
              <Select id="profile-weight-unit" {...register("weightUnit")}>
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </Select>
            </div>
            <div className="field-group">
              <label htmlFor="profile-timezone">Zona horaria</label>
              <Select id="profile-timezone" {...register("timezone")}>
                <option value="America/La_Paz">America/La_Paz</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/Madrid">Europe/Madrid</option>
              </Select>
            </div>
            <div className="field-group">
              <label htmlFor="profile-week-start">Semana comienza</label>
              <Select id="profile-week-start" {...register("weekStartsOn")}>
                <option value={1}>Lunes</option>
                <option value={7}>Domingo</option>
              </Select>
            </div>
            <Button type="submit" loading={isSubmitting}>Guardar cambios</Button>
          </form>
        </Card>
        <Card className="card-soft">
          <div className="card-kicker">Decisión de datos</div>
          <h2>Kg sigue siendo la verdad.</h2>
          <p className="muted">Cambiar kg/lb solo afecta la presentación y las entradas futuras; no reinterpreta el historial.</p>
          <div className="profile-rule"><span className="rule-dot" /> sesión privada por defecto</div>
          <div className="profile-rule"><span className="rule-dot" /> sin eliminación de cuenta en V1</div>
        </Card>
      </div>
    </main>
  );
}

