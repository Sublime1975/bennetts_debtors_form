"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { useFormState } from "@/lib/form-context";
import { validateBanking } from "@/lib/validation";
import { ACCOUNT_TYPES, COUNTRIES } from "@/lib/constants";
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
    <StepShell title="Banking details" description="Your bank account information for our records." onNext={handleNext}>
      <CheckboxField
        id="isForeignBank"
        label="My bank account is outside South Africa"
        checked={banking.isForeignBank}
        onChange={(checked) => updateSection("banking", { isForeignBank: checked })}
      />
      <Field
        label="Account holder name"
        required
        placeholder="Name as it appears on the account"
        value={banking.accountHolder}
        onChange={(e) => updateSection("banking", { accountHolder: e.target.value })}
        error={errors.accountHolder}
      />
      <Field
        label="Bank name"
        required
        placeholder={banking.isForeignBank ? "e.g. Barclays, HSBC, Deutsche Bank" : "Start typing bank name…"}
        value={banking.bankName}
        onChange={(e) => updateSection("banking", { bankName: e.target.value })}
        error={errors.bankName}
      />
      <AnimatePresence mode="wait">
        {banking.isForeignBank ? (
          <motion.div key="foreign" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
            <SelectField
              label="Bank country"
              required
              placeholder="Select bank country"
              options={COUNTRIES}
              value={banking.bankCountry}
              onChange={(e) => updateSection("banking", { bankCountry: e.target.value })}
              error={errors.bankCountry}
            />
            <div>
              <Field
                label="IBAN / Account number"
                required
                placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
                value={banking.accountNumber}
                onChange={(e) => updateSection("banking", { accountNumber: e.target.value })}
                error={errors.accountNumber}
              />
              <p className="mt-1.5 font-body text-xs text-muted">Enter your IBAN where applicable, or your account number</p>
            </div>
            <div>
              <Field
                label="SWIFT / BIC code"
                required
                placeholder="e.g. FIRNZAJJ or FIRNZAJJXXX"
                value={banking.swiftCode}
                onChange={(e) => updateSection("banking", { swiftCode: e.target.value })}
                error={errors.swiftCode}
              />
              <p className="mt-1.5 font-body text-xs text-muted">8 or 11 character code found on your bank statement</p>
            </div>
            <Field
              label="Bank address (optional)"
              value={banking.bankAddress}
              onChange={(e) => updateSection("banking", { bankAddress: e.target.value })}
            />
          </motion.div>
        ) : (
          <motion.div key="local" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
            <div>
              <Field
                label="Branch code"
                required
                placeholder="6 digits, e.g. 250655"
                value={banking.branchCode}
                onChange={(e) => updateSection("banking", { branchCode: e.target.value })}
                error={errors.branchCode}
              />
              <p className="mt-1.5 font-body text-xs text-muted">Universal branch code from your bank statement</p>
            </div>
            <div>
              <Field
                label="Account number"
                required
                placeholder="Digits only"
                value={banking.accountNumber}
                onChange={(e) => updateSection("banking", { accountNumber: e.target.value })}
                error={errors.accountNumber}
              />
              <p className="mt-1.5 font-body text-xs text-muted">6-16 digits</p>
            </div>
            <SelectField
              label="Account type"
              required
              placeholder="Select account type"
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
