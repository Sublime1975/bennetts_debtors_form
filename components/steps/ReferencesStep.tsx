"use client";

import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { useFormState } from "@/lib/form-context";
import { validateReferences } from "@/lib/validation";
import { formatPhoneNumber } from "@/lib/phone";
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
    <StepShell title="Trade references" description="Two of your existing suppliers who can vouch for this business." onNext={handleNext}>
      {(["tradeRef1", "tradeRef2"] as const).map((key, i) => (
        <div key={key} className={i > 0 ? "pt-2" : ""}>
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
              onBlur={() => {
                // Trade references have no country field of their own; treat as a local SA
                // number for uniform +27 formatting unless the supplier typed an explicit
                // country code (leading +), which we preserve as-is.
                const isLocal = !references[key].phone.trim().startsWith("+");
                const formatted = formatPhoneNumber(references[key].phone, isLocal);
                if (formatted !== references[key].phone) updateTradeRef(key, { phone: formatted });
              }}
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
