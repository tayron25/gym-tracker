import { useEffect, useRef, type PropsWithChildren } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

type DialogProps = PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  onClose(): void;
}>;

export function Dialog({ children, description, onClose, open, title }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      const panel = panelRef.current;
      const initial = panel?.querySelector<HTMLElement>("[data-dialog-autofocus]");
      const fallback = panel?.querySelector<HTMLElement>("input, select, textarea, button");
      (initial ?? fallback)?.focus();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
        ref={panelRef}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
          if (event.key === "Tab") {
            const focusable = Array.from(
              panelRef.current?.querySelectorAll<HTMLElement>(
                'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]',
              ) ?? [],
            );
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <header className="dialog-heading">
          <div>
            <h2 id="dialog-title">{title}</h2>
            {description && <p id="dialog-description">{description}</p>}
          </div>
          <Button className="icon-button" variant="quiet" aria-label="Cerrar diálogo" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </Button>
        </header>
        {children}
      </div>
    </div>
  );
}
