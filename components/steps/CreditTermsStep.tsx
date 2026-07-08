"use client";

import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { useFormState } from "@/lib/form-context";
import { validateCredit } from "@/lib/validation";
import { PAYMENT_TERMS_OPTIONS } from "@/lib/constants";

export function CreditTermsStep() {
  const { formData, updateSection, errors, setErrors, goNext } = useFormState();
  const { credit } = formData;

  const handleNext = () => {
    const stepErrors = validateCredit(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  return (
    <StepShell
      title="Credit application terms"
      onNext={handleNext}
      showRequiredNote={false}
      footnote="Credit limit and payment terms exclude projects, which are payable on specific project-based terms as quoted."
    >
      <Field
        label="Credit limit requested (ZAR)"
        inputMode="numeric"
        required
        placeholder="e.g. 100000"
        prefix="R"
        value={credit.creditLimitRequested}
        onChange={(e) => updateSection("credit", { creditLimitRequested: e.target.value.replace(/[^\d]/g, "") })}
        error={errors.creditLimitRequested}
      />
      <Field
        label="Estimated monthly purchase volume (ZAR)"
        inputMode="numeric"
        placeholder="Optional"
        prefix="R"
        value={credit.estimatedMonthlyPurchase}
        onChange={(e) => updateSection("credit", { estimatedMonthlyPurchase: e.target.value.replace(/[^\d]/g, "") })}
        error={errors.estimatedMonthlyPurchase}
      />
      <SelectField
        label="Payment terms requested"
        placeholder="Select payment terms"
        options={PAYMENT_TERMS_OPTIONS}
        value={credit.paymentTermsRequested}
        onChange={(e) => updateSection("credit", { paymentTermsRequested: e.target.value })}
        error={errors.paymentTermsRequested}
      />
    </StepShell>
  );
}
