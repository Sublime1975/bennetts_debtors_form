import { LogoMark } from "@/components/decorative/LogoMark";

export function Header() {
  return (
    <div className="relative z-10 w-full max-w-2xl flex items-center gap-3 mb-8 px-1">
      <LogoMark />
      <div className="flex flex-col">
        <span className="font-display text-base leading-tight text-ink">Bennett&apos;s Engineering</span>
        <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted">Debtor Application</span>
      </div>
    </div>
  );
}
