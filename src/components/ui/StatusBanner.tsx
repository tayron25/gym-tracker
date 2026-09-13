import type { ReactNode } from "react";

type StatusBannerProps = {
  children: ReactNode;
  variant?: "error" | "success" | "info";
};

export function StatusBanner({ children, variant = "info" }: StatusBannerProps) {
  return (
    <div
      className={`status-banner status-${variant}`}
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {children}
    </div>
  );
}

