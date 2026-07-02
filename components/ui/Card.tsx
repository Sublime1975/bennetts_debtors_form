import { ReactNode } from "react";

export function Card({ children, size = "wide" }: { children: ReactNode; size?: "sm" | "wide" }) {
  return (
    <div
      className={`relative w-full ${size === "sm" ? "max-w-md" : "max-w-2xl"} rounded-3xl p-9`}
      style={{
        background: "#1C1B19",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 20px 60px -15px rgba(0,0,0,0.6)",
      }}
    >
      {children}
    </div>
  );
}
