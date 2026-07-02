import { ButtonHTMLAttributes } from "react";

export function BackButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="font-body text-sm flex items-center gap-1 text-muted hover:text-ink transition-colors focus-copper rounded"
      type="button"
    >
      <span aria-hidden="true">‹</span> {children ?? "Back"}
    </button>
  );
}
