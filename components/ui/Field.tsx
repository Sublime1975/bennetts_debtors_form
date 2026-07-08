import { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Short static prefix rendered inside the input, e.g. "R" for currency fields. */
  prefix?: string;
}

export function Field({ label, error, required, id, className = "", prefix, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  const leftPadding = prefix ? 16 + prefix.length * 8 + 6 : 16;
  return (
    <label className="block" htmlFor={inputId}>
      <span className="font-body text-xs tracking-wide text-muted">
        {label}
        {required && <span style={{ color: "#E3B679" }}> *</span>}
      </span>
      <span className="relative mt-2 block">
        {prefix && (
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 font-body text-sm pointer-events-none"
            style={{ color: "#A8A29E" }}
          >
            {prefix}
          </span>
        )}
        <input
          {...props}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`focus-copper w-full font-body text-sm rounded-xl py-3 outline-none transition-all duration-200 ${className}`}
          style={{
            paddingLeft: leftPadding,
            paddingRight: 16,
            background: "rgba(255,255,255,0.04)",
            border: error ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.08)",
            color: "#FAFAF8",
          }}
        />
      </span>
      {error && (
        <span id={`${inputId}-error`} className="mt-1.5 block text-xs text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}
