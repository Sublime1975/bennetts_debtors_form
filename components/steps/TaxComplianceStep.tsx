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
            <div>
              <Field
                label="VAT number"
                required
                placeholder="e.g. 4123456789"
                maxLength={10}
                value={tax.vatNumber}
                onChange={(e) => updateSection("tax", { vatNumber: e.target.value })}
                error={errors.vatNumber}
              />
              <p className="mt-1.5 font-body text-xs text-muted">10 digits, always starts with 4</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div>
        <Field
          label="Income tax number"
          required
          placeholder="e.g. 0123456789"
          maxLength={10}
          value={tax.incomeTaxNumber}
          onChange={(e) => updateSection("tax", { incomeTaxNumber: e.target.value })}
          error={errors.incomeTaxNumber}
        />
        <p className="mt-1.5 font-body text-xs text-muted">10 digits, starts with 0, 1, 2, 3 or 9</p>
      </div>
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
