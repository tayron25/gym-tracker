import {
  Activity,
  BarChart3,
  ClipboardList,
  Dumbbell,
  History,
  Home,
  LogOut,
  Settings,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Brand } from "../../components/shared/Brand";

const primaryNav = [
  { to: "/app", label: "Inicio", icon: Home, end: true },
  { to: "/app/routines", label: "Rutinas", icon: ClipboardList },
  { to: "/app/workout/active", label: "Entrenar", icon: Dumbbell },
  { to: "/app/history", label: "Historial", icon: History },
  { to: "/app/progress", label: "Progreso", icon: BarChart3 },
];

const secondaryNav = [
  { to: "/app/exercises", label: "Ejercicios", icon: Activity },
  { to: "/app/settings", label: "Ajustes", icon: Settings },
];

function NavigationLink({
  end,
  icon: Icon,
  label,
  to,
}: (typeof primaryNav)[number]) {
  return (
    <NavLink
      className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
      end={end}
      to={to}
    >
      <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}

export function AppShell() {
  const { profile, session, signOut } = useAuth();
  const queryLocation = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  const routeLabel = queryLocation.pathname.replace(/^\/app\/?/, "");
  const visibleRoute = routeLabel ? `/${routeLabel}` : "/app";
  const initials = (profile?.displayName ?? "GT")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Brand />
        <div className="sidebar-group">
          <p className="sidebar-label">Tu semana</p>
          <nav aria-label="Navegación principal">
            {primaryNav.map((item) => (
              <NavigationLink key={item.to} {...item} />
            ))}
          </nav>
        </div>
        <div className="sidebar-group sidebar-secondary">
          <p className="sidebar-label">Más</p>
          <nav aria-label="Navegación secundaria">
            {secondaryNav.map((item) => (
              <NavigationLink key={item.to} {...item} />
            ))}
          </nav>
        </div>
        <div className="sidebar-foot">
          <span>SPR-06</span>
          <small>Historial y progreso · datos simulados</small>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <span className="topbar-route">{visibleRoute}</span>
          <div className="topbar-actions">
            <div className="profile-chip">
              <span className="avatar" aria-hidden="true">{initials}</span>
              <span>
                <strong>{profile?.displayName ?? "Atleta"}</strong>
                <small>{session?.email}</small>
              </span>
            </div>
            <Button
              aria-label="Cerrar sesión"
              loading={isSigningOut}
              onClick={() => void handleSignOut()}
              variant="quiet"
              className="icon-button"
              title="Cerrar sesión"
            >
              <LogOut size={17} aria-hidden="true" />
            </Button>
          </div>
        </header>
        <Outlet />
        <nav className="mobile-nav" aria-label="Navegación móvil">
          {primaryNav.map((item) => (
            <NavigationLink key={item.to} {...item} />
          ))}
        </nav>
      </div>
    </div>
  );
}
