"use client";

import { AnimatePresence } from "framer-motion";
import { AmbientBackdrop } from "@/components/decorative/AmbientBackdrop";
import { WelcomeStep } from "@/components/steps/WelcomeStep";
import { CompanyDetailsStep } from "@/components/steps/CompanyDetailsStep";
import { ContactDetailsStep } from "@/components/steps/ContactDetailsStep";
import { DirectorsStep } from "@/components/steps/DirectorsStep";
import { ReferencesStep } from "@/components/steps/ReferencesStep";
import { TaxComplianceStep } from "@/components/steps/TaxComplianceStep";
import { BankingDetailsStep } from "@/components/steps/BankingDetailsStep";
import { DocumentUploadsStep } from "@/components/steps/DocumentUploadsStep";
import { CreditTermsStep } from "@/components/steps/CreditTermsStep";
import { SuretyshipStep } from "@/components/steps/SuretyshipStep";
import { ReviewStep } from "@/components/steps/ReviewStep";
import { ConfirmationStep } from "@/components/steps/ConfirmationStep";
import { useFormState } from "@/lib/form-context";
import { StepId } from "@/lib/types";

const STEP_COMPONENTS: Record<StepId, () => JSX.Element> = {
  welcome: WelcomeStep,
  company: CompanyDetailsStep,
  contact: ContactDetailsStep,
  directors: DirectorsStep,
  references: ReferencesStep,
  tax: TaxComplianceStep,
  banking: BankingDetailsStep,
  documents: DocumentUploadsStep,
  credit: CreditTermsStep,
  suretyship: SuretyshipStep,
  review: ReviewStep,
  confirmation: ConfirmationStep,
};

export function Wizard() {
  const { currentStep } = useFormState();
  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-16 px-4" style={{ background: "#141413" }}>
      <AmbientBackdrop />
      <AnimatePresence mode="wait">
        <div key={currentStep} className="relative z-10 w-full flex flex-col items-center">
          <StepComponent />
        </div>
      </AnimatePresence>
    </div>
  );
}
