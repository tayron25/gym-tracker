import { BarChart3, Dumbbell, History } from "lucide-react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { LoadingState } from "../../components/shared/LoadingState";
import { ForgotPasswordPage } from "../../features/auth/ForgotPasswordPage";
import { LoginPage } from "../../features/auth/LoginPage";
import { RegisterPage } from "../../features/auth/RegisterPage";
import { ResetPasswordPage } from "../../features/auth/ResetPasswordPage";
import { ProfilePage } from "../../features/profile/ProfilePage";
import { ExerciseDetailPage } from "../../features/exercises/ExerciseDetailPage";
import { ExercisesPage } from "../../features/exercises/ExercisesPage";
import { RoutineEditorPage } from "../../features/routines/RoutineEditorPage";
import { RoutinesPage } from "../../features/routines/RoutinesPage";
import { AppShell } from "../../features/shell/AppShell";
import { DashboardPage } from "../../features/shell/DashboardPage";
import { PlaceholderPage } from "../../features/shell/PlaceholderPage";

export function ProtectedRoute() {
  const { isLoading, session } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingState />;
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isLoading, session } = useAuth();

  if (isLoading) return <LoadingState />;
  return session ? <Navigate to="/app" replace /> : <Outlet />;
}

function NotFoundPage() {
  return (
    <main className="auth-page">
      <div className="auth-frame">
        <p className="eyebrow">Ruta no encontrada</p>
        <h1>Este camino todavía no existe.</h1>
        <a className="button button-primary button-link" href="/app">
          Volver a inicio
        </a>
      </div>
    </main>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/routines" element={<RoutinesPage />} />
          <Route path="/app/routines/new" element={<RoutineEditorPage />} />
          <Route path="/app/routines/:id" element={<RoutineEditorPage />} />
          <Route
            path="/app/workout/active"
            element={
              <PlaceholderPage
                eyebrow="Entrenamiento"
                title="Workout activo."
                description="La pantalla donde cada serie confirmada deja un registro real."
                icon={Dumbbell}
              />
            }
          />
          <Route
            path="/app/history"
            element={
              <PlaceholderPage
                eyebrow="Hechos guardados"
                title="Historial."
                description="Sesiones completadas y snapshots históricos, sin reescrituras."
                icon={History}
              />
            }
          />
          <Route path="/app/exercises" element={<ExercisesPage />} />
          <Route path="/app/exercises/:id" element={<ExerciseDetailPage />} />
          <Route
            path="/app/progress"
            element={
              <PlaceholderPage
                eyebrow="Lectura de progreso"
                title="Progreso."
                description="PR, e1RM y series semanales cuando existan datos reales."
                icon={BarChart3}
              />
            }
          />
          <Route path="/app/settings" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
