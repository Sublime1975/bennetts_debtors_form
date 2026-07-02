"use client";

import { motion } from "framer-motion";
import { BlueprintGrid } from "@/components/decorative/BlueprintGrid";
import { CornerBrackets } from "@/components/decorative/CornerBrackets";
import { GradientButton } from "@/components/ui/GradientButton";
import { useFormState } from "@/lib/form-context";

export function WelcomeStep() {
  const { goNext } = useFormState();

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="relative w-full max-w-md rounded-3xl p-10 overflow-hidden text-center"
      style={{
        background: "linear-gradient(160deg, #1C1B19, #17140F)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 20px 60px -15px rgba(0,0,0,0.6)",
      }}
    >
      <BlueprintGrid opacity={0.06} />
      <div className="absolute inset-3 pointer-events-none">
        <CornerBrackets />
      </div>
      <div className="relative z-10 flex flex-col items-center py-6">
        <div
          className="font-body text-[10px] tracking-[0.3em] uppercase px-3 py-1 rounded-full mb-6"
          style={{ background: "#C9863F1A", color: "#E3B679", border: "1px solid #C9863F44" }}
        >
          Est. 1957
        </div>
        <h1 className="font-display text-3xl leading-tight mb-3 text-ink">
          Debtor
          <br />
          Application
        </h1>
        <p className="font-body text-sm mb-10 max-w-[280px] text-muted">
          Open a credit account with Bennett&apos;s Engineering. Tell us about your business.
        </p>
        <GradientButton full onClick={() => goNext()}>
          Start application
        </GradientButton>
        <p className="font-body text-[11px] mt-5 text-muted">Takes about 10 minutes</p>
      </div>
    </motion.div>
  );
}
