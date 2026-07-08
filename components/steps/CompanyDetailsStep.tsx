"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { ToggleField } from "@/components/ui/ToggleField";
import { useFormState } from "@/lib/form-context";
import { validateCompany } from "@/lib/validation";
import { ENTITY_TYPES, ENTITY_TYPES_BY_COUNTRY, FOREIGN_ENTITY_TYPES, COUNTRIES } from "@/lib/constants";

export function regNumberLabel(entityType: string): string {
  if (entityType === "CC") return "CK registration number";
  if (entityType === "Sole Proprietor" || entityType === "Partnership") return "Income tax registration number";
  if (entityType === "Trust") return "Trust (IT) registration number";
  return "CIPC registration number";
}

function regNumberPlaceholder(entityType: string): string {
  if (entityType === "CC") return "e.g. CK2007/123456";
  if (entityType === "Sole Proprietor" || entityType === "Partnership") return "e.g. 0123456789";
  if (entityType === "Trust") return "e.g. IT1234/17";
  return "e.g. 2024/123456/07";
}

function regNumberHelper(entityType: string): string {
  if (entityType === "CC") return "Format: CK followed by registration year and number, as shown on your founding statement";
  if (entityType === "Sole Proprietor" || entityType === "Partnership")
    return "10 digits, starts with 0, 1, 2, 3 or 9 — as shown on your SARS income tax registration";
  if (entityType === "Trust") return "Master's Office reference number, e.g. IT1234/17";
  return "Format: YYYY/NNNNNN/NN as shown on your CIPC certificate";
}

export function CompanyDetailsStep() {
  const { formData, updateSection, errors, setErrors, goNext } = useFormState();
  const { company } = formData;

  const handleNext = () => {
    const stepErrors = validateCompany(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  const entityOptions = company.isForeignEntity
    ? ENTITY_TYPES_BY_COUNTRY[company.countryOfRegistration] || FOREIGN_ENTITY_TYPES
    : ENTITY_TYPES;

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
      <div>
        <Field
          label="Website"
          name="website"
          placeholder="www.kaypegafabrication.co.za"
          value={company.website}
          onChange={(e) => updateSection("company", { website: e.target.value })}
        />
        <p className="mt-1.5 font-body text-xs text-muted">Leave blank if no website</p>
      </div>
      <ToggleField
        label="Local or foreign entity?"
        required
        trueLabel="Foreign"
        falseLabel="Local"
        value={company.isForeignEntity}
        onChange={(value) => updateSection("company", { isForeignEntity: value, entityType: "" })}
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
            <SelectField
              label="Country of registration"
              required
              placeholder="Select country"
              options={COUNTRIES.filter((c) => c !== "South Africa")}
              value={company.countryOfRegistration}
              onChange={(e) => updateSection("company", { countryOfRegistration: e.target.value, entityType: "" })}
              error={errors.countryOfRegistration}
            />
            <SelectField
              label="Entity type"
              required
              placeholder="Select entity type"
              options={entityOptions}
              value={company.entityType}
              onChange={(e) => updateSection("company", { entityType: e.target.value })}
              error={errors.entityType}
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
          <motion.div key="local" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
            <SelectField
              label="Entity type"
              required
              placeholder="Select entity type"
              options={entityOptions}
              value={company.entityType}
              onChange={(e) => updateSection("company", { entityType: e.target.value })}
              error={errors.entityType}
            />
            <div>
              <Field
                label={regNumberLabel(company.entityType)}
                required
                placeholder={regNumberPlaceholder(company.entityType)}
                value={company.cipcNumber}
                onChange={(e) => updateSection("company", { cipcNumber: e.target.value })}
                error={errors.cipcNumber}
              />
              <p className="mt-1.5 font-body text-xs text-muted">{regNumberHelper(company.entityType)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}
