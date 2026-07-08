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
import { regNumberLabel } from "./CompanyDetailsStep";

function EditLink({ stepId, onEdit }: { stepId: StepId; onEdit: (step: StepId) => void }) {
  return (
    <button
      type="button"
      onClick={() => onEdit(stepId)}
      className="focus-copper flex items-center gap-1 font-body text-xs transition-colors rounded"
      style={{ color: "#E3B679" }}
    >
      <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" aria-hidden="true">
        <path
          d="M11 2l3 3-8 8-3.5.5.5-3.5 8-8z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Edit
    </button>
  );
}

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
        <EditLink stepId={stepId} onEdit={onEdit} />
      </div>
      <dl>
        {rows.map(([label, value], i) => (
          <div
            key={label}
            className="flex justify-between gap-4 py-2 text-sm font-body"
            style={i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.06)" } : undefined}
          >
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
    [
      tax.vatRegistered ? "VAT notice of registration" : "SARS notice of registration",
      tax.vatRegistered ? documents.vatNoticeOfRegistration?.name ?? "" : documents.sarsNoticeOfRegistration?.name ?? "",
    ],
    ["B-BBEE certificate", documents.bbeeCertificate?.name ?? ""],
    ["Bank confirmation letter", documents.bankConfirmationLetter?.name ?? ""],
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
        <h2 className="font-display text-2xl mb-1 text-ink">Review & submit</h2>
        <p className="font-body text-sm mb-8 text-muted">Please review your details before submitting.</p>

        <div className="space-y-4">
          <ReviewGroup
            title="Company details"
            stepId="company"
            onEdit={goToStep}
            rows={[
              ["Trading name", company.tradingName],
              ["Registered name", company.registeredName],
              ["Website", company.website],
              ["Entity type", company.entityType],
              ["Local or foreign", company.isForeignEntity === null ? "" : company.isForeignEntity ? "Foreign" : "Local"],
              ...(company.isForeignEntity
                ? ([
                    ["Country of registration", company.countryOfRegistration],
                    ["Foreign registration number", company.foreignRegistrationNumber],
                  ] as [string, string][])
                : ([[regNumberLabel(company.entityType), company.cipcNumber]] as [string, string][])),
            ]}
          />
          <ReviewGroup
            title="Contact details"
            stepId="contact"
            onEdit={goToStep}
            rows={[
              ["Accounts Payable contact", contact.accountsContactName],
              ["Accounts Payable email", contact.accountsEmail],
              ["Accounts Payable phone", contact.accountsPhone],
              ["Accounts Payable cell", contact.accountsCell],
              ["Accounts Payable address", contact.accountsPhysicalAddress],
              ["Country", contact.country],
              [
                "Accounts Payable postal address",
                contact.accountsPostalSameAsPhysical ? contact.accountsPhysicalAddress : contact.accountsPostalAddress,
              ],
              ...(contact.buyerContactDifferent
                ? ([
                    ["Buyer/Procurement contact", `${contact.buyerContactName} (${contact.buyerEmail})`],
                    ["Buyer/Procurement phone", contact.buyerPhone],
                    ["Buyer/Procurement cell", contact.buyerCell],
                  ] as [string, string][])
                : []),
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
              ["Local or foreign", banking.isForeignBank ? "Foreign" : "Local"],
              ["Account holder", banking.accountHolder],
              ["Bank name", banking.bankName],
              ["Account number", banking.accountNumber],
              ...(banking.isForeignBank
                ? ([
                    ["Bank country", banking.bankCountry],
                    ["SWIFT/BIC code", banking.swiftCode],
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
              [
                "Credit limit requested",
                credit.creditLimitRequested ? `R ${Number(credit.creditLimitRequested).toLocaleString("en-ZA")}` : "",
              ],
              [
                "Estimated monthly purchases",
                credit.estimatedMonthlyPurchase ? `R ${Number(credit.estimatedMonthlyPurchase).toLocaleString("en-ZA")}` : "",
              ],
              ["Payment terms requested", credit.paymentTermsRequested],
            ]}
          />
          <ReviewGroup
            title="Suretyship agreement"
            stepId="suretyship"
            onEdit={goToStep}
            rows={directors.map(
              (d, i) =>
                [
                  `Surety ${i + 1}${d.fullName ? ` — ${d.fullName}` : ""}`,
                  d.suretyshipAgreed && d.suretyshipSignature ? `Signed ${d.suretyshipDate || ""}`.trim() : "Not signed",
                ] as [string, string]
            )}
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
            label="I confirm the information provided is accurate and up to date."
            checked={consent.accurateInfo}
            onChange={(checked) => updateSection("consent", { accurateInfo: checked })}
            error={errors.accurateInfo}
          />
          <CheckboxField
            id="popiConsent"
            label="I consent to Bennett's Engineering processing this information in accordance with the POPI Act."
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
