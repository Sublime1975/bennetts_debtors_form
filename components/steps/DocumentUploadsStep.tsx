"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { PillProgress } from "@/components/ui/PillProgress";
import { GradientButton } from "@/components/ui/GradientButton";
import { BackButton } from "@/components/ui/BackButton";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { LaserPerforation } from "@/components/decorative/LaserPerforation";
import { useFormState } from "@/lib/form-context";
import { validateDocuments } from "@/lib/validation";
import { DATA_STEPS } from "@/lib/constants";

export function DocumentUploadsStep() {
  const { formData, updateSection, errors, setErrors, goNext, goBack, currentStep } = useFormState();
  const { documents, tax } = formData;
  const stepIndex = DATA_STEPS.indexOf(currentStep);

  const handleNext = () => {
    const stepErrors = validateDocuments(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="w-full flex flex-col items-center"
    >
      <Header />
      <div className="relative w-full max-w-2xl">
        <LaserPerforation className="absolute -top-4 -right-4 z-0" />
        <Card>
          <PillProgress step={stepIndex} total={DATA_STEPS.length} />
          <h2 className="font-display text-2xl mb-1 text-ink">Document uploads</h2>
          <p className="font-body text-sm mb-8 text-muted">PDF, JPG or PNG — max 10MB each.</p>
          <div className="space-y-5">
            <FileDropzone
              id="cipcCertificate"
              label="Company Registration Certificate (CIPC)"
              required
              value={documents.cipcCertificate}
              onChange={(meta) => updateSection("documents", { cipcCertificate: meta })}
              error={errors.cipcCertificate}
            />
            {tax.vatRegistered && (
              <FileDropzone
                id="vatCertificate"
                label="VAT Certificate"
                required
                value={documents.vatCertificate}
                onChange={(meta) => updateSection("documents", { vatCertificate: meta })}
                error={errors.vatCertificate}
              />
            )}
            <FileDropzone
              id="sarsNoticeOfRegistration"
              label="SARS Notice of Registration"
              required
              value={documents.sarsNoticeOfRegistration}
              onChange={(meta) => updateSection("documents", { sarsNoticeOfRegistration: meta })}
              error={errors.sarsNoticeOfRegistration}
            />
            <FileDropzone
              id="proofOfAddress"
              label="Proof of Address (utility bill, less than 3 months old)"
              required
              value={documents.proofOfAddress}
              onChange={(meta) => updateSection("documents", { proofOfAddress: meta })}
              error={errors.proofOfAddress}
            />
            <FileDropzone
              id="bankConfirmationLetter"
              label="Bank Confirmation Letter"
              required
              value={documents.bankConfirmationLetter}
              onChange={(meta) => updateSection("documents", { bankConfirmationLetter: meta })}
              error={errors.bankConfirmationLetter}
            />
          </div>
          <div className="flex items-center justify-between mt-10">
            <BackButton onClick={goBack} />
            <GradientButton onClick={handleNext}>
              Next step<span aria-hidden="true"> ›</span>
            </GradientButton>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
