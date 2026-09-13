import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from "react";

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void error;
    void info;
    // La implementación real de observabilidad se conectará sin registrar datos sensibles.
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="auth-page">
        <div className="auth-frame error-fallback">
          <p className="eyebrow">Estado recuperable</p>
          <h1>La pantalla necesita volver a empezar.</h1>
          <p className="auth-description">Conservamos tu sesión simulada y puedes regresar al inicio.</p>
          <a className="button button-primary button-link" href="/app">Volver a inicio</a>
        </div>
      </main>
    );
  }
}
