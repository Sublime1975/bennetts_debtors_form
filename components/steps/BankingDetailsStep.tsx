"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { ToggleField } from "@/components/ui/ToggleField";
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
      <ToggleField
        label="Local or foreign bank account?"
        required
        trueLabel="Foreign"
        falseLabel="Local"
        value={banking.isForeignBank}
        onChange={(value) => updateSection("banking", { isForeignBank: value })}
        error={errors.isForeignBank}
      />
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
        label={banking.isForeignBank ? "Account number / IBAN" : "Account number"}
        required
        value={banking.accountNumber}
        onChange={(e) => updateSection("banking", { accountNumber: e.target.value })}
        error={errors.accountNumber}
      />
      <AnimatePresence mode="wait">
        {banking.isForeignBank === true && (
          <motion.div
            key="foreign"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-5"
          >
            <Field
              label="SWIFT / BIC code"
              required
              placeholder="e.g. ABSAZAJJ"
              value={banking.swiftCode}
              onChange={(e) => updateSection("banking", { swiftCode: e.target.value })}
              error={errors.swiftCode}
            />
            <Field
              label="Bank country"
              required
              value={banking.bankCountry}
              onChange={(e) => updateSection("banking", { bankCountry: e.target.value })}
              error={errors.bankCountry}
            />
            <Field
              label="Account currency"
              required
              placeholder="e.g. USD"
              value={banking.accountCurrency}
              onChange={(e) => updateSection("banking", { accountCurrency: e.target.value })}
              error={errors.accountCurrency}
            />
            <Field
              label="Bank address (optional)"
              value={banking.bankAddress}
              onChange={(e) => updateSection("banking", { bankAddress: e.target.value })}
            />
          </motion.div>
        )}
        {banking.isForeignBank === false && (
          <motion.div
            key="local"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-5"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}
