"use client";

import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { AddressField } from "@/components/ui/AddressField";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { useFormState } from "@/lib/form-context";
import { validateDirectors } from "@/lib/validation";

export function DirectorsStep() {
  const { formData, addDirector, removeDirector, updateDirector, errors, setErrors, goNext } = useFormState();
  const { directors } = formData;

  const handleNext = () => {
    const stepErrors = validateDirectors(directors);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  return (
    <StepShell
      title="Directors & members"
      description="Full details of each director, member or proprietor of the business."
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
              <span className="font-body text-xs tracking-wide uppercase text-muted">Director {index + 1}</span>
              {directors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDirector(index)}
                  className="focus-copper font-body text-xs text-muted hover:text-red-400 transition-colors rounded"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="space-y-5">
              <Field
                label="Full name"
                required
                value={director.fullName}
                onChange={(e) => updateDirector(index, { fullName: e.target.value })}
                error={errors[`directors.${index}.fullName`]}
              />
              <Field
                label="SA ID number"
                required
                inputMode="numeric"
                maxLength={13}
                placeholder="13 digits"
                value={director.idNumber}
                onChange={(e) => updateDirector(index, { idNumber: e.target.value.replace(/\D/g, "").slice(0, 13) })}
                error={errors[`directors.${index}.idNumber`]}
              />
              <AddressField
                id={`director-${index}-address`}
                label="Residential address"
                required
                value={director.residentialAddress}
                onChange={(value) => updateDirector(index, { residentialAddress: value })}
                error={errors[`directors.${index}.residentialAddress`]}
              />
              <FileDropzone
                id={`director-${index}-id`}
                label="ID document"
                required
                value={director.idDocument}
                onChange={(meta) => updateDirector(index, { idDocument: meta })}
                error={errors[`directors.${index}.idDocument`]}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addDirector}
        className="focus-copper mt-2 font-body text-sm rounded-full px-5 py-2.5 transition-all duration-200 hover:brightness-125"
        style={{ background: "rgba(255,255,255,0.05)", color: "#E3B679", border: "1px solid #C9863F44" }}
      >
        + Add another director
      </button>
    </StepShell>
  );
}
