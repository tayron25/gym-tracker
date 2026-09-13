import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Brand } from "../../components/shared/Brand";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({
  children,
  description,
  eyebrow,
  footer,
  title,
}: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <div className="auth-atmosphere" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="auth-frame">
        <Link className="auth-brand-link" to="/login" aria-label="Gym Tracker, ir al acceso">
          <Brand compact />
        </Link>
        <section className="auth-card" aria-labelledby="auth-title">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </section>
        <p className="auth-caption">Registro privado · datos bajo tu control</p>
      </div>
    </main>
  );
}

