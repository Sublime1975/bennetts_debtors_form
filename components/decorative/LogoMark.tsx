"use client";

import { useEffect, useState } from "react";

export function LogoMark() {
  const [logoAvailable, setLogoAvailable] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setLogoAvailable(true);
    img.onerror = () => setLogoAvailable(false);
    img.src = "/logo.png";
  }, []);

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <div
        className="absolute w-16 h-16 rounded-full blur-xl animate-logo-pulse"
        style={{ background: "radial-gradient(circle, #C9863F66, transparent 70%)" }}
      />
      <div
        className="relative w-11 h-11 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-110"
        style={{
          background: "linear-gradient(145deg, #1C1B19, #141413)",
          border: "1px solid #C9863F77",
          boxShadow: "0 0 14px 1px #C9863F55, inset 0 0 8px #C9863F22",
        }}
      >
        {logoAvailable ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/logo.png" alt="Bennett's Engineering" className="w-full h-full object-contain p-1" />
        ) : (
          <span
            className="font-display text-base leading-none"
            style={{ color: "#E3B679", textShadow: "0 0 8px #C9863Faa" }}
          >
            BE
          </span>
        )}
      </div>
    </div>
  );
}
