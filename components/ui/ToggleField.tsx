interface ToggleFieldProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  error?: string;
  required?: boolean;
}

export function ToggleField({ label, value, onChange, error, required }: ToggleFieldProps) {
  return (
    <div>
      <span className="font-body text-xs tracking-wide text-muted">
        {label}
        {required && <span style={{ color: "#E3B679" }}> *</span>}
      </span>
      <div className="mt-2 flex gap-2 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)" }}>
        {(["Yes", "No"] as const).map((label2, i) => {
          const optionValue = i === 0;
          const selected = value === optionValue;
          return (
            <button
              key={label2}
              type="button"
              onClick={() => onChange(optionValue)}
              className="focus-copper flex-1 rounded-lg py-2.5 text-sm font-body transition-all duration-200"
              style={{
                background: selected ? "#C9863F" : "transparent",
                color: selected ? "#141413" : "#A8A29E",
              }}
              aria-pressed={selected}
            >
              {label2}
            </button>
          );
        })}
      </div>
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </div>
  );
}
