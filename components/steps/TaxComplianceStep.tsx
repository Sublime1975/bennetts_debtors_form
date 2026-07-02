"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { ToggleField } from "@/components/ui/ToggleField";
import { useFormState } from "@/lib/form-context";
import { validateTax } from "@/lib/validation";
import { BBEE_LEVELS } from "@/lib/constants";
import { BbeeLevel } from "@/lib/types";

export function TaxComplianceStep() {
  const { formData, updateSection, errors, setErrors, goNext } = useFormState();
  const { tax } = formData;

  const handleNext = () => {
    const stepErrors = validateTax(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  return (
    <StepShell title="Tax & compliance" description="Your tax registration and B-BBEE status." onNext={handleNext}>
      <ToggleField
        label="VAT registered?"
        required
        value={tax.vatRegistered}
        onChange={(value) => updateSection("tax", { vatRegistered: value })}
        error={errors.vatRegistered}
      />
      <AnimatePresence>
        {tax.vatRegistered && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Field
              label="VAT number"
              required
              value={tax.vatNumber}
              onChange={(e) => updateSection("tax", { vatNumber: e.target.value })}
              error={errors.vatNumber}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Field
        label="Income tax number"
        required
        value={tax.incomeTaxNumber}
        onChange={(e) => updateSection("tax", { incomeTaxNumber: e.target.value })}
        error={errors.incomeTaxNumber}
      />
      <SelectField
        label="B-BBEE level"
        required
        placeholder="Select B-BBEE level"
        options={BBEE_LEVELS}
        value={tax.bbeeLevel}
        onChange={(e) => updateSection("tax", { bbeeLevel: e.target.value as BbeeLevel })}
        error={errors.bbeeLevel}
      />
    </StepShell>
  );
}
