"use client";

import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { useFormState } from "@/lib/form-context";
import { validateBanking } from "@/lib/validation";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { AccountType } from "@/lib/types";

export function BankingDetailsStep() {
  const { formData, updateSection, errors, setErrors, goNext } = useFormState();
  const { banking } = formData;

  const handleNext = () => {
    const stepErrors = validateBanking(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  return (
    <StepShell title="Banking details" description="The business's own banking details, for our records." onNext={handleNext}>
      <Field
        label="Bank name"
        required
        value={banking.bankName}
        onChange={(e) => updateSection("banking", { bankName: e.target.value })}
        error={errors.bankName}
      />
      <Field
        label="Account holder name"
        required
        value={banking.accountHolder}
        onChange={(e) => updateSection("banking", { accountHolder: e.target.value })}
        error={errors.accountHolder}
      />
      <Field
        label="Account number"
        required
        value={banking.accountNumber}
        onChange={(e) => updateSection("banking", { accountNumber: e.target.value })}
        error={errors.accountNumber}
      />
      <Field
        label="Branch code"
        required
        value={banking.branchCode}
        onChange={(e) => updateSection("banking", { branchCode: e.target.value })}
        error={errors.branchCode}
      />
      <SelectField
        label="Account type"
        required
        options={ACCOUNT_TYPES}
        value={banking.accountType}
        onChange={(e) => updateSection("banking", { accountType: e.target.value as AccountType })}
        error={errors.accountType}
      />
    </StepShell>
  );
}
