"use client";

import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { useFormState } from "@/lib/form-context";
import { validateSuretyship } from "@/lib/validation";

export function SuretyshipStep() {
  const { formData, updateDirector, errors, setErrors, goNext } = useFormState();
  const { directors, company } = formData;

  const handleNext = () => {
    const stepErrors = validateSuretyship(directors);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  const businessName = company.tradingName || "the business";

  return (
    <StepShell
      title="Suretyship agreement"
      description="Each director or member below must read, agree to, and digitally sign this suretyship."
      onNext={handleNext}
    >
      <div className="space-y-8">
        {directors.map((director, index) => (
          <div
            key={index}
            className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-body text-xs tracking-wide uppercase text-muted">
                Surety {index + 1}
                {director.fullName ? ` — ${director.fullName}` : ""}
              </span>
            </div>

            <div
              className="rounded-xl p-4 mb-5 font-body text-xs leading-relaxed text-muted"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="mb-2">
                In consideration of Bennett&apos;s Engineering agreeing to grant credit facilities to {businessName}, I,{" "}
                {director.fullName || "the undersigned director/member"}
                {director.idNumber ? ` (ID no. ${director.idNumber})` : ""}, hereby bind myself as surety for and
                co-principal debtor with {businessName} for the due and punctual payment of all amounts owed to
                Bennett&apos;s Engineering, whether now or in the future, together with interest and any collection
                costs, and renounce the legal benefits of excussion, division and cession of action.
              </p>
              <p>
                This is a real, binding personal guarantee. Read it carefully — if you&apos;re unsure of what you&apos;re
                agreeing to, get independent advice before signing.
              </p>
            </div>

            <div className="space-y-5">
              <CheckboxField
                id={`suretyship-${index}-agreed`}
                label="I have read and agree to be personally bound by this suretyship."
                checked={director.suretyshipAgreed}
                onChange={(checked) => updateDirector(index, { suretyshipAgreed: checked })}
                error={errors[`suretyship.${index}.agreed`]}
              />
              <Field
                label="Full name (signature)"
                required
                placeholder="Type your full name exactly as above to sign"
                value={director.suretyshipSignature}
                onChange={(e) => updateDirector(index, { suretyshipSignature: e.target.value })}
                error={errors[`suretyship.${index}.signature`]}
              />
              <Field
                label="Date"
                type="date"
                required
                value={director.suretyshipDate}
                onChange={(e) => updateDirector(index, { suretyshipDate: e.target.value })}
                error={errors[`suretyship.${index}.date`]}
              />
              <SignaturePad
                label="Draw your signature (optional, in addition to typed name above)"
                value={director.suretyshipDrawnSignature}
                onChange={(dataUrl) => updateDirector(index, { suretyshipDrawnSignature: dataUrl })}
              />
            </div>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
