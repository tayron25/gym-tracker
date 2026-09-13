import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "quiet" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({
  children,
  className = "",
  loading = false,
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Guardando…" : children}
    </button>
  );
}

