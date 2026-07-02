export function AmbientBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.15] blur-[120px]"
        style={{ background: "#C9863F" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[100px]"
        style={{ background: "#E3B679" }}
      />
    </div>
  );
}
