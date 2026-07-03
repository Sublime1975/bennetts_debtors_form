"use client";

import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { useFormState } from "@/lib/form-context";
import { validateCredit } from "@/lib/validation";

export function CreditTermsStep() {
  const { formData, updateSection, errors, setErrors, goNext } = useFormState();
  const { credit } = formData;

  const handleNext = () => {
    const stepErrors = validateCredit(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  return (
    <StepShell title="Credit application terms" onNext={handleNext}>
      <Field
        label="Credit limit requested (ZAR)"
        type="number"
        required
        placeholder="e.g. 100000"
        value={credit.creditLimitRequested}
        onChange={(e) => updateSection("credit", { creditLimitRequested: e.target.value })}
        error={errors.creditLimitRequested}
      />
      <Field
        label="Estimated monthly purchase volume (ZAR)"
        type="number"
        placeholder="Optional"
        value={credit.estimatedMonthlyPurchase}
        onChange={(e) => updateSection("credit", { estimatedMonthlyPurchase: e.target.value })}
        error={errors.estimatedMonthlyPurchase}
      />
      <Field
        label="Payment terms requested"
        placeholder="e.g. 30 days from statement"
        value={credit.paymentTermsRequested}
        onChange={(e) => updateSection("credit", { paymentTermsRequested: e.target.value })}
      />
      <CheckboxField
        id="suretyshipAgreement"
        label="A director/member agrees to sign personal suretyship for this credit facility if required"
        checked={credit.suretyshipAgreement}
        onChange={(checked) => updateSection("credit", { suretyshipAgreement: checked })}
        error={errors.suretyshipAgreement}
      />
    </StepShell>
  );
}
