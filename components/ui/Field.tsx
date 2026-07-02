import { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({ label, error, required, id, className = "", ...props }: FieldProps) {
  const inputId = id ?? props.name;
  return (
    <label className="block" htmlFor={inputId}>
      <span className="font-body text-xs tracking-wide text-muted">
        {label}
        {required && <span style={{ color: "#E3B679" }}> *</span>}
      </span>
      <input
        {...props}
        id={inputId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`focus-copper mt-2 w-full font-body text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200 ${className}`}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: error ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.08)",
          color: "#FAFAF8",
        }}
      />
      {error && (
        <span id={`${inputId}-error`} className="mt-1.5 block text-xs text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}
