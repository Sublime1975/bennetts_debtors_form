"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { useFormState } from "@/lib/form-context";

export function ConfirmationStep() {
  const { referenceNumber, resetForm } = useFormState();

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="w-full flex justify-center"
    >
      <Card size="sm">
        <div className="flex flex-col items-center text-center py-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: "linear-gradient(135deg, #C9863F, #E3B679)", boxShadow: "0 0 30px 4px #C9863F55" }}
          >
            <svg viewBox="0 0 26 26" className="w-7 h-7" fill="none" aria-hidden="true">
              <path d="M5 13l5.5 5.5L21 8" stroke="#141413" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-display text-2xl mb-2 text-ink">Application received</h2>
          <p className="font-body text-sm mb-6 max-w-xs text-muted">
            Thank you. We&apos;ll review your credit application and be in touch within 3 business days.
          </p>
          <div
            className="font-body text-xs tracking-wider rounded-full px-4 py-2 mb-8"
            style={{ background: "rgba(255,255,255,0.05)", color: "#E3B679" }}
          >
            REF: {referenceNumber ?? "—"}
          </div>
          <GradientButton full onClick={resetForm}>
            Return to homepage
          </GradientButton>
        </div>
      </Card>
    </motion.div>
  );
}
