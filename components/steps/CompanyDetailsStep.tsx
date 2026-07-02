"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { ToggleField } from "@/components/ui/ToggleField";
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
        placeholder="e.g. Kaypega Fabrication"
        value={company.tradingName}
        onChange={(e) => updateSection("company", { tradingName: e.target.value })}
        error={errors.tradingName}
      />
      <Field
        label="Registered company name (if different from trading name)"
        name="registeredName"
        placeholder="Leave blank if same as above"
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
      <ToggleField
        label="Local or foreign entity?"
        required
        trueLabel="Foreign"
        falseLabel="Local"
        value={company.isForeignEntity}
        onChange={(value) => updateSection("company", { isForeignEntity: value })}
        error={errors.isForeignEntity}
      />
      <AnimatePresence mode="wait">
        {company.isForeignEntity === true && (
          <motion.div
            key="foreign"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-5"
          >
            <Field
              label="Country of registration"
              required
              value={company.countryOfRegistration}
              onChange={(e) => updateSection("company", { countryOfRegistration: e.target.value })}
              error={errors.countryOfRegistration}
            />
            <Field
              label="Foreign registration number"
              required
              value={company.foreignRegistrationNumber}
              onChange={(e) => updateSection("company", { foreignRegistrationNumber: e.target.value })}
              error={errors.foreignRegistrationNumber}
            />
          </motion.div>
        )}
        {company.isForeignEntity === false && (
          <motion.div key="local" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div>
              <Field
                label="CIPC registration number"
                required
                placeholder="e.g. 2024/123456/07"
                value={company.cipcNumber}
                onChange={(e) => updateSection("company", { cipcNumber: e.target.value })}
                error={errors.cipcNumber}
              />
              <p className="mt-1.5 font-body text-xs text-muted">Format: YYYY/NNNNNN/NN as shown on your CIPC certificate</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}
