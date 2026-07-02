"use client";

import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { useFormState } from "@/lib/form-context";
import { validateReferences } from "@/lib/validation";
import { TradeReference } from "@/lib/types";

export function ReferencesStep() {
  const { formData, updateSection, errors, setErrors, goNext } = useFormState();
  const { references } = formData;

  const handleNext = () => {
    const stepErrors = validateReferences(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  const updateTradeRef = (key: "tradeRef1" | "tradeRef2", patch: Partial<TradeReference>) => {
    updateSection("references", { [key]: { ...references[key], ...patch } });
  };

  return (
    <StepShell title="Trade & bank references" description="Used to verify creditworthiness." onNext={handleNext}>
      <p className="font-body text-xs tracking-wide uppercase text-muted">Bank reference</p>
      <Field
        label="Bank name"
        required
        value={references.bankName}
        onChange={(e) => updateSection("references", { bankName: e.target.value })}
        error={errors.bankName}
      />
      <Field
        label="Branch"
        required
        value={references.bankBranch}
        onChange={(e) => updateSection("references", { bankBranch: e.target.value })}
        error={errors.bankBranch}
      />
      <Field
        label="Bank contact person"
        required
        value={references.bankContactPerson}
        onChange={(e) => updateSection("references", { bankContactPerson: e.target.value })}
        error={errors.bankContactPerson}
      />
      <Field
        label="Bank contact telephone"
        type="tel"
        required
        value={references.bankContactTel}
        onChange={(e) => updateSection("references", { bankContactTel: e.target.value })}
        error={errors.bankContactTel}
      />

      {(["tradeRef1", "tradeRef2"] as const).map((key, i) => (
        <div key={key} className="pt-2">
          <p className="font-body text-xs tracking-wide uppercase text-muted mb-5">Trade reference {i + 1}</p>
          <div className="space-y-5">
            <Field
              label="Company name"
              required
              value={references[key].companyName}
              onChange={(e) => updateTradeRef(key, { companyName: e.target.value })}
              error={errors[`${key}.companyName`]}
            />
            <Field
              label="Contact person"
              required
              value={references[key].contactPerson}
              onChange={(e) => updateTradeRef(key, { contactPerson: e.target.value })}
              error={errors[`${key}.contactPerson`]}
            />
            <Field
              label="Phone"
              type="tel"
              required
              value={references[key].phone}
              onChange={(e) => updateTradeRef(key, { phone: e.target.value })}
              error={errors[`${key}.phone`]}
            />
            <Field
              label="Email"
              type="email"
              required
              value={references[key].email}
              onChange={(e) => updateTradeRef(key, { email: e.target.value })}
              error={errors[`${key}.email`]}
            />
          </div>
        </div>
      ))}
    </StepShell>
  );
}
