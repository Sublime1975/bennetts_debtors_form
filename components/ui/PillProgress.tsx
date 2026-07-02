export function PillProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-10" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full h-1.5 rounded-full transition-all duration-300"
              style={{
                background: done || active ? "linear-gradient(90deg, #C9863F, #E3B679)" : "rgba(255,255,255,0.08)",
                boxShadow: active ? "0 0 12px 1px #C9863F66" : "none",
              }}
            />
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-body transition-all duration-300"
              style={{
                background: done ? "#C9863F" : active ? "transparent" : "rgba(255,255,255,0.06)",
                border: active ? "1.5px solid #C9863F" : "1.5px solid transparent",
                color: done ? "#141413" : active ? "#E3B679" : "#A8A29E",
                boxShadow: active ? "0 0 10px 1px #C9863F55" : "none",
              }}
            >
              {done ? "✓" : i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}
