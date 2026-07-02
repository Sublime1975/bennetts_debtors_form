"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { AddressField } from "@/components/ui/AddressField";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { useFormState } from "@/lib/form-context";
import { validateContact } from "@/lib/validation";

export function ContactDetailsStep() {
  const { formData, updateSection, errors, setErrors, goNext } = useFormState();
  const { contact } = formData;

  const handleNext = () => {
    const stepErrors = validateContact(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  return (
    <StepShell title="Contact details" description="Who should we speak to about this application?" onNext={handleNext}>
      <Field
        label="Contact person"
        name="contactPerson"
        required
        value={contact.contactPerson}
        onChange={(e) => updateSection("contact", { contactPerson: e.target.value })}
        error={errors.contactPerson}
      />
      <Field
        label="Email address"
        name="email"
        type="email"
        required
        value={contact.email}
        onChange={(e) => updateSection("contact", { email: e.target.value })}
        error={errors.email}
      />
      <Field
        label="Phone number"
        name="phone"
        type="tel"
        required
        placeholder="082 000 0000"
        value={contact.phone}
        onChange={(e) => updateSection("contact", { phone: e.target.value })}
        error={errors.phone}
      />
      <AddressField
        id="physicalAddress"
        label="Physical address"
        required
        value={contact.physicalAddress}
        onChange={(value) => updateSection("contact", { physicalAddress: value })}
        error={errors.physicalAddress}
      />
      <CheckboxField
        id="postalSameAsPhysical"
        label="Postal address same as physical"
        checked={contact.postalSameAsPhysical}
        onChange={(checked) => updateSection("contact", { postalSameAsPhysical: checked })}
      />
      <AnimatePresence>
        {!contact.postalSameAsPhysical && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <AddressField
              id="postalAddress"
              label="Postal address"
              value={contact.postalAddress}
              onChange={(value) => updateSection("contact", { postalAddress: value })}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <CheckboxField
        id="accountsContactDifferent"
        label="Accounts/invoicing contact is different from above"
        checked={contact.accountsContactDifferent}
        onChange={(checked) => updateSection("contact", { accountsContactDifferent: checked })}
      />
      <AnimatePresence>
        {contact.accountsContactDifferent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-5"
          >
            <Field
              label="Accounts contact name"
              name="accountsContactName"
              required
              value={contact.accountsContactName}
              onChange={(e) => updateSection("contact", { accountsContactName: e.target.value })}
              error={errors.accountsContactName}
            />
            <Field
              label="Accounts contact email"
              name="accountsEmail"
              type="email"
              required
              value={contact.accountsEmail}
              onChange={(e) => updateSection("contact", { accountsEmail: e.target.value })}
              error={errors.accountsEmail}
            />
            <Field
              label="Accounts contact phone"
              name="accountsPhone"
              type="tel"
              required
              value={contact.accountsPhone}
              onChange={(e) => updateSection("contact", { accountsPhone: e.target.value })}
              error={errors.accountsPhone}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}
