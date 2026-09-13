export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true" />
      <div>
        <strong>Gym Tracker</strong>
        {!compact && <span>Registro de fuerza</span>}
      </div>
    </div>
  );
}

