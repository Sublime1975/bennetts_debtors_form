export function LaserPerforation({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="120" height="120" style={{ opacity: 0.35 }} aria-hidden="true">
      <defs>
        <pattern id="laser-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#C9863F" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#laser-dots)" />
    </svg>
  );
}
