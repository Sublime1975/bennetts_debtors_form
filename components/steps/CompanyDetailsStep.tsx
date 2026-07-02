"use client";

import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { useFormState } from "@/lib/form-context";
import { validateCompany } from "@/lib/validation";
import { ENTITY_TYPES } from "@/lib/constants";
import { EntityType } from "@/lib/types";

export function CompanyDetailsStep() {
  const { formData, updateSection, errors, setErrors, goNext } = useFormState();
  const { company } = formData;

  const handleNext = () => {
    const stepErrors = validateCompany(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  return (
    <StepShell title="Company details" description="Tell us about the business applying for credit." onNext={handleNext}>
      <Field
        label="Trading name"
        name="tradingName"
        required
        value={company.tradingName}
        onChange={(e) => updateSection("company", { tradingName: e.target.value })}
        error={errors.tradingName}
      />
      <Field
        label="Registered company name (if different)"
        name="registeredName"
        value={company.registeredName}
        onChange={(e) => updateSection("company", { registeredName: e.target.value })}
      />
      <SelectField
        label="Entity type"
        name="entityType"
        required
        options={ENTITY_TYPES}
        value={company.entityType}
        onChange={(e) => updateSection("company", { entityType: e.target.value as EntityType })}
        error={errors.entityType}
      />
      <Field
        label="CIPC registration number"
        name="cipcNumber"
        required
        value={company.cipcNumber}
        onChange={(e) => updateSection("company", { cipcNumber: e.target.value })}
        error={errors.cipcNumber}
      />
    </StepShell>
  );
}
