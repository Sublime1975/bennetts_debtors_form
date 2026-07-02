export function BlueprintGrid({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full" style={{ opacity }} aria-hidden="true">
      <defs>
        <pattern id="bp-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#E3B679" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-grid)" />
    </svg>
  );
}
