import { SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: string[];
  placeholder?: string;
}

export function SelectField({ label, error, required, id, options, placeholder = "Select…", className = "", ...props }: SelectFieldProps) {
  const selectId = id ?? props.name;
  return (
    <label className="block" htmlFor={selectId}>
      <span className="font-body text-xs tracking-wide text-muted">
        {label}
        {required && <span style={{ color: "#E3B679" }}> *</span>}
      </span>
      <select
        {...props}
        id={selectId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={`focus-copper mt-2 w-full font-body text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200 appearance-none ${className}`}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: error ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.08)",
          color: "#FAFAF8",
        }}
      >
        <option value="" disabled style={{ color: "#A8A29E" }}>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: "#1C1B19", color: "#FAFAF8" }}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${selectId}-error`} className="mt-1.5 block text-xs text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}
