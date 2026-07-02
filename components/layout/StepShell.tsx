"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Header } from "./Header";
import { Card } from "@/components/ui/Card";
import { PillProgress } from "@/components/ui/PillProgress";
import { GradientButton } from "@/components/ui/GradientButton";
import { BackButton } from "@/components/ui/BackButton";
import { useFormState } from "@/lib/form-context";
import { DATA_STEPS } from "@/lib/constants";

interface StepShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function StepShell({ title, description, children, onNext, nextLabel = "Next step", nextDisabled }: StepShellProps) {
  const { currentStep, goBack } = useFormState();
  const stepIndex = DATA_STEPS.indexOf(currentStep);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="w-full flex flex-col items-center"
    >
      <Header />
      <Card>
        <PillProgress step={stepIndex} total={DATA_STEPS.length} />
        <h2 className="font-display text-2xl mb-1 text-ink">{title}</h2>
        {description && <p className="font-body text-sm mb-8 text-muted">{description}</p>}
        <div className="space-y-5">{children}</div>
        <div className="flex items-center justify-between mt-10">
          <BackButton onClick={goBack} />
          <GradientButton onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
          </GradientButton>
        </div>
      </Card>
    </motion.div>
  );
}
