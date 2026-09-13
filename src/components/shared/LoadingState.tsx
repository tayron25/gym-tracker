export function LoadingState({ label = "Cargando tu sesión" }: { label?: string }) {
  return (
    <main className="loading-screen" aria-busy="true" aria-live="polite">
      <span className="loading-mark" aria-hidden="true" />
      <p>{label}</p>
    </main>
  );
}

