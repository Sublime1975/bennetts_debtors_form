"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StepShell } from "@/components/layout/StepShell";
import { Field } from "@/components/ui/Field";
import { AddressField } from "@/components/ui/AddressField";
import { SelectField } from "@/components/ui/SelectField";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { useFormState } from "@/lib/form-context";
import { validateContact } from "@/lib/validation";
import { COUNTRIES } from "@/lib/constants";
import { formatPhoneNumber } from "@/lib/phone";
import { ContactDetails } from "@/lib/types";

export function ContactDetailsStep() {
  const { formData, updateSection, errors, setErrors, goNext } = useFormState();
  const { contact } = formData;
  const isLocal = contact.country === "South Africa" || contact.country === "";
  const countryCode = contact.country === "South Africa" ? "za" : undefined;

  const handleNext = () => {
    const stepErrors = validateContact(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goNext();
  };

  const normalizePhoneField = (key: keyof ContactDetails) => () => {
    const formatted = formatPhoneNumber(contact[key] as string, isLocal);
    if (formatted !== contact[key]) updateSection("contact", { [key]: formatted });
  };

  return (
    <StepShell title="Contact details" description="Who should we speak to about this application?" onNext={handleNext}>
      <p className="font-body text-xs tracking-wide uppercase font-semibold text-ink">Accounts Payable contact</p>
      <Field
        label="Accounts Payable contact name"
        required
        placeholder="Full name"
        value={contact.accountsContactName}
        onChange={(e) => updateSection("contact", { accountsContactName: e.target.value })}
        error={errors.accountsContactName}
      />
      <Field
        label="Accounts Payable email address"
        type="email"
        required
        placeholder="name@company.co.za"
        value={contact.accountsEmail}
        onChange={(e) => updateSection("contact", { accountsEmail: e.target.value })}
        error={errors.accountsEmail}
      />
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <Field
            label="Accounts Payable office number"
            type="tel"
            required
            placeholder="082 000 0000 or +27 82 000 0000"
            value={contact.accountsPhone}
            onChange={(e) => updateSection("contact", { accountsPhone: e.target.value })}
            onBlur={normalizePhoneField("accountsPhone")}
            error={errors.accountsPhone}
          />
        </div>
        <div className="flex-1 min-w-0">
          <Field
            label="Accounts Payable cell number"
            type="tel"
            placeholder="082 123 4567"
            value={contact.accountsCell}
            onChange={(e) => updateSection("contact", { accountsCell: e.target.value })}
            onBlur={normalizePhoneField("accountsCell")}
            error={errors.accountsCell}
          />
        </div>
      </div>
      <AddressField
        id="accountsPhysicalAddress"
        label="Accounts Payable physical address"
        required
        placeholder="Start typing your street address…"
        value={contact.accountsPhysicalAddress}
        onChange={(value) => updateSection("contact", { accountsPhysicalAddress: value })}
        error={errors.accountsPhysicalAddress}
        countryCode={countryCode}
      />
      <SelectField
        label="Country"
        required
        placeholder="Select country"
        options={COUNTRIES}
        value={contact.country}
        onChange={(e) => updateSection("contact", { country: e.target.value })}
        error={errors.country}
      />
      <CheckboxField
        id="accountsPostalSameAsPhysical"
        label="Postal address same as physical"
        checked={contact.accountsPostalSameAsPhysical}
        onChange={(checked) => updateSection("contact", { accountsPostalSameAsPhysical: checked })}
      />
      <AnimatePresence>
        {!contact.accountsPostalSameAsPhysical && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <AddressField
              id="accountsPostalAddress"
              label="Postal address"
              value={contact.accountsPostalAddress}
              onChange={(value) => updateSection("contact", { accountsPostalAddress: value })}
              countryCode={countryCode}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <CheckboxField
        id="buyerContactDifferent"
        label="Buyer/Procurement contact is different from above"
        checked={contact.buyerContactDifferent}
        onChange={(checked) => updateSection("contact", { buyerContactDifferent: checked })}
      />
      <AnimatePresence>
        {contact.buyerContactDifferent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-5"
          >
            <p className="font-body text-xs tracking-wide uppercase font-semibold text-ink">Buyer/Procurement contact</p>
            <Field
              label="Buyer/Procurement contact name"
              required
              value={contact.buyerContactName}
              onChange={(e) => updateSection("contact", { buyerContactName: e.target.value })}
              error={errors.buyerContactName}
            />
            <Field
              label="Buyer/Procurement contact email"
              type="email"
              required
              value={contact.buyerEmail}
              onChange={(e) => updateSection("contact", { buyerEmail: e.target.value })}
              error={errors.buyerEmail}
            />
            <div className="flex gap-4">
              <div className="flex-1 min-w-0">
                <Field
                  label="Buyer/Procurement contact phone"
                  type="tel"
                  required
                  placeholder="011 000 0000 or +27 11 000 0000"
                  value={contact.buyerPhone}
                  onChange={(e) => updateSection("contact", { buyerPhone: e.target.value })}
                  onBlur={normalizePhoneField("buyerPhone")}
                  error={errors.buyerPhone}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Field
                  label="Buyer/Procurement cell number"
                  type="tel"
                  placeholder="082 123 4567"
                  value={contact.buyerCell}
                  onChange={(e) => updateSection("contact", { buyerCell: e.target.value })}
                  onBlur={normalizePhoneField("buyerCell")}
                  error={errors.buyerCell}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}
