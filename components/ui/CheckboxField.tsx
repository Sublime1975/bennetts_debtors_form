interface CheckboxFieldProps {
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  id?: string;
}

export function CheckboxField({ label, checked, onChange, error, id }: CheckboxFieldProps) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer" htmlFor={id}>
        <span className="relative shrink-0 mt-0.5">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <span
            className="focus-copper block w-5 h-5 rounded-md transition-all duration-150 peer-focus-visible:ring-2"
            style={{
              background: checked ? "#C9863F" : "rgba(255,255,255,0.04)",
              border: checked ? "1px solid #C9863F" : "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {checked && (
              <svg viewBox="0 0 16 16" className="w-full h-full p-0.5" fill="none" aria-hidden="true">
                <path d="M3 8l3.5 3.5L13 5" stroke="#141413" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </span>
        <span className="font-body text-sm text-ink">{label}</span>
      </label>
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </div>
  );
}
