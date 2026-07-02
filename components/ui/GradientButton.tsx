import { ButtonHTMLAttributes } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  full?: boolean;
}

export function GradientButton({ children, full, className = "", ...props }: GradientButtonProps) {
  return (
    <button
      {...props}
      className={`font-body font-medium text-sm rounded-full px-6 py-3.5 transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 focus-copper ${
        full ? "w-full" : ""
      } ${className}`}
      style={{
        background: "linear-gradient(135deg, #C9863F, #E3B679)",
        color: "#141413",
        boxShadow: "0 4px 20px -4px #C9863F66",
      }}
    >
      {children}
    </button>
  );
}
