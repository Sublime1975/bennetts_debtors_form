"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { BackButton } from "@/components/ui/BackButton";
import { Field } from "@/components/ui/Field";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { useFormState } from "@/lib/form-context";
import { validateDeclarationAndConsent } from "@/lib/validation";
import { generateReferenceNumber } from "@/lib/reference-number";
import { StepId } from "@/lib/types";

function ReviewGroup({
  title,
  stepId,
  rows,
  onEdit,
}: {
  title: string;
  stepId: StepId;
  rows: [string, string][];
  onEdit: (step: StepId) => void;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-body text-xs tracking-wide uppercase text-muted">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepId)}
          className="focus-copper font-body text-xs transition-colors rounded"
          style={{ color: "#E3B679" }}
        >
          Edit
        </button>
      </div>
      <dl className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-sm font-body">
            <dt className="text-muted">{label}</dt>
            <dd className="text-ink text-right truncate">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ReviewStep() {
  const { formData, updateSection, errors, setErrors, goToStep, goBack, setReferenceNumber } = useFormState();
  const { company, contact, directors, references, tax, banking, documents, credit, declaration, consent } = formData;

  const handleSubmit = () => {
    const stepErrors = validateDeclarationAndConsent(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      const ref = generateReferenceNumber();
      // eslint-disable-next-line no-console
      console.log("Debtor application submitted:", formData);
      setReferenceNumber(ref);
      goToStep("confirmation");
    }
  };

  const documentRows: [string, string][] = [
    ["CIPC certificate", documents.cipcCertificate?.name ?? ""],
    ["VAT certificate", documents.vatCertificate?.name ?? ""],
    ["SARS notice of registration", documents.sarsNoticeOfRegistration?.name ?? ""],
    ["Proof of address", documents.proofOfAddress?.name ?? ""],
    ["Bank confirmation letter", documents.bankConfirmationLetter?.name ?? ""],
    ["Suretyship (optional)", documents.suretyshipDoc?.name ?? ""],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="w-full flex flex-col items-center"
    >
      <Header />
      <Card>
        <h2 className="font-display text-2xl mb-1 text-ink">Review & declaration</h2>
        <p className="font-body text-sm mb-8 text-muted">Check everything below before submitting.</p>

        <div className="space-y-4">
          <ReviewGroup
            title="Company details"
            stepId="company"
            onEdit={goToStep}
            rows={[
              ["Trading name", company.tradingName],
              ["Registered name", company.registeredName],
              ["Entity type", company.entityType],
              ["Local or foreign", company.isForeignEntity === null ? "" : company.isForeignEntity ? "Foreign" : "Local"],
              ...(company.isForeignEntity
                ? ([
                    ["Country of registration", company.countryOfRegistration],
                    ["Foreign registration number", company.foreignRegistrationNumber],
                  ] as [string, string][])
                : ([["CIPC number", company.cipcNumber]] as [string, string][])),
            ]}
          />
          <ReviewGroup
            title="Contact details"
            stepId="contact"
            onEdit={goToStep}
            rows={[
              ["Contact person", contact.contactPerson],
              ["Email", contact.email],
              ["Phone", contact.phone],
              ["Physical address", contact.physicalAddress],
              ["Postal address", contact.postalSameAsPhysical ? contact.physicalAddress : contact.postalAddress],
            ]}
          />
          <ReviewGroup
            title="Directors & members"
            stepId="directors"
            onEdit={goToStep}
            rows={directors.map((d, i) => [`Director ${i + 1}`, `${d.fullName} (${d.idNumber})`] as [string, string])}
          />
          <ReviewGroup
            title="Trade references"
            stepId="references"
            onEdit={goToStep}
            rows={[
              ["Trade ref 1", references.tradeRef1.companyName],
              ["Trade ref 2", references.tradeRef2.companyName],
            ]}
          />
          <ReviewGroup
            title="Tax & compliance"
            stepId="tax"
            onEdit={goToStep}
            rows={[
              ["VAT registered", tax.vatRegistered === null ? "" : tax.vatRegistered ? "Yes" : "No"],
              ["VAT number", tax.vatNumber],
              ["Income tax number", tax.incomeTaxNumber],
              ["B-BBEE level", tax.bbeeLevel],
            ]}
          />
          <ReviewGroup
            title="Banking details"
            stepId="banking"
            onEdit={goToStep}
            rows={[
              ["Local or foreign", banking.isForeignBank === null ? "" : banking.isForeignBank ? "Foreign" : "Local"],
              ["Bank name", banking.bankName],
              ["Account holder", banking.accountHolder],
              ["Account number", banking.accountNumber],
              ...(banking.isForeignBank
                ? ([
                    ["SWIFT/BIC code", banking.swiftCode],
                    ["Bank country", banking.bankCountry],
                    ["Account currency", banking.accountCurrency],
                  ] as [string, string][])
                : ([
                    ["Branch code", banking.branchCode],
                    ["Account type", banking.accountType],
                  ] as [string, string][])),
            ]}
          />
          <ReviewGroup title="Document uploads" stepId="documents" onEdit={goToStep} rows={documentRows} />
          <ReviewGroup
            title="Credit application terms"
            stepId="credit"
            onEdit={goToStep}
            rows={[
              ["Credit limit requested", credit.creditLimitRequested ? `R${credit.creditLimitRequested}` : ""],
              ["Estimated monthly purchases", credit.estimatedMonthlyPurchase ? `R${credit.estimatedMonthlyPurchase}` : ""],
              ["Payment terms requested", credit.paymentTermsRequested],
            ]}
          />
        </div>

        <div className="mt-8 pt-6 space-y-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="font-body text-xs tracking-wide uppercase text-muted">Declaration</p>
          <Field
            label="Full name (signature)"
            required
            placeholder="Type your full name to sign"
            value={declaration.signatureFullName}
            onChange={(e) => updateSection("declaration", { signatureFullName: e.target.value })}
            error={errors.signatureFullName}
          />
          <Field
            label="Date"
            type="date"
            required
            value={declaration.signatureDate}
            onChange={(e) => updateSection("declaration", { signatureDate: e.target.value })}
            error={errors.signatureDate}
          />
          <CheckboxField
            id="accurateInfo"
            label="I confirm the information provided is accurate"
            checked={consent.accurateInfo}
            onChange={(checked) => updateSection("consent", { accurateInfo: checked })}
            error={errors.accurateInfo}
          />
          <CheckboxField
            id="popiConsent"
            label="I consent to Bennett's Engineering processing this information in accordance with the POPI Act"
            checked={consent.popiConsent}
            onChange={(checked) => updateSection("consent", { popiConsent: checked })}
            error={errors.popiConsent}
          />
        </div>

        <div className="flex items-center justify-between mt-10">
          <BackButton onClick={goBack} />
          <GradientButton onClick={handleSubmit} disabled={!consent.accurateInfo || !consent.popiConsent}>
            Submit application
          </GradientButton>
        </div>
      </Card>
    </motion.div>
  );
}
