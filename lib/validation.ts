import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "./constants";
import { AppFormData, Director, FieldErrors, UploadedFileMeta } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SA_PHONE_RE = /^(\+27|0)[1-9]\d{8}$/;

function requireField(errors: FieldErrors, key: string, value: string, message = "This field is required") {
  if (!value || value.trim() === "") {
    errors[key] = message;
  }
}

export function validateCompany(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { company } = data;
  requireField(errors, "tradingName", company.tradingName);
  requireField(errors, "entityType", company.entityType, "Select an entity type");
  requireField(errors, "cipcNumber", company.cipcNumber);
  return errors;
}

export function validateContact(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { contact } = data;
  requireField(errors, "contactPerson", contact.contactPerson);
  requireField(errors, "email", contact.email);
  if (contact.email && !EMAIL_RE.test(contact.email)) {
    errors.email = "Enter a valid email address";
  }
  requireField(errors, "phone", contact.phone);
  if (contact.phone && !SA_PHONE_RE.test(contact.phone.replace(/\s/g, ""))) {
    errors.phone = "Enter a valid South African phone number";
  }
  requireField(errors, "physicalAddress", contact.physicalAddress);

  if (contact.accountsContactDifferent) {
    requireField(errors, "accountsContactName", contact.accountsContactName);
    requireField(errors, "accountsEmail", contact.accountsEmail);
    if (contact.accountsEmail && !EMAIL_RE.test(contact.accountsEmail)) {
      errors.accountsEmail = "Enter a valid email address";
    }
    requireField(errors, "accountsPhone", contact.accountsPhone);
  }
  return errors;
}

function validateDirector(director: Director, index: number, errors: FieldErrors) {
  requireField(errors, `directors.${index}.fullName`, director.fullName);
  requireField(errors, `directors.${index}.idNumber`, director.idNumber);
  requireField(errors, `directors.${index}.residentialAddress`, director.residentialAddress);
  if (!director.idDocument) {
    errors[`directors.${index}.idDocument`] = "Upload a copy of this director's ID";
  }
}

export function validateDirectors(directors: Director[]): FieldErrors {
  const errors: FieldErrors = {};
  if (directors.length === 0) {
    errors.directors = "At least one director/member is required";
    return errors;
  }
  directors.forEach((director, index) => validateDirector(director, index, errors));
  return errors;
}

export function validateReferences(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { references } = data;
  requireField(errors, "bankName", references.bankName);
  requireField(errors, "bankBranch", references.bankBranch);
  requireField(errors, "bankContactPerson", references.bankContactPerson);
  requireField(errors, "bankContactTel", references.bankContactTel);

  (["tradeRef1", "tradeRef2"] as const).forEach((key) => {
    const ref = references[key];
    requireField(errors, `${key}.companyName`, ref.companyName);
    requireField(errors, `${key}.contactPerson`, ref.contactPerson);
    requireField(errors, `${key}.phone`, ref.phone);
    requireField(errors, `${key}.email`, ref.email);
    if (ref.email && !EMAIL_RE.test(ref.email)) {
      errors[`${key}.email`] = "Enter a valid email address";
    }
  });
  return errors;
}

export function validateTax(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { tax } = data;
  if (tax.vatRegistered === null) {
    errors.vatRegistered = "Select whether the business is VAT registered";
  }
  if (tax.vatRegistered) {
    requireField(errors, "vatNumber", tax.vatNumber);
  }
  requireField(errors, "incomeTaxNumber", tax.incomeTaxNumber);
  requireField(errors, "bbeeLevel", tax.bbeeLevel, "Select a B-BBEE level");
  return errors;
}

export function validateBanking(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { banking } = data;
  requireField(errors, "bankName", banking.bankName);
  requireField(errors, "accountHolder", banking.accountHolder);
  requireField(errors, "accountNumber", banking.accountNumber);
  requireField(errors, "branchCode", banking.branchCode);
  requireField(errors, "accountType", banking.accountType, "Select an account type");
  return errors;
}

function validateFileField(errors: FieldErrors, key: string, file: UploadedFileMeta | null, required: boolean) {
  if (!file) {
    if (required) errors[key] = "This document is required";
    return;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    errors[key] = "File must be 10MB or smaller";
  } else if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    errors[key] = "File must be a PDF, JPG or PNG";
  }
}

export function validateDocuments(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { documents, tax } = data;
  validateFileField(errors, "cipcCertificate", documents.cipcCertificate, true);
  validateFileField(errors, "vatCertificate", documents.vatCertificate, !!tax.vatRegistered);
  validateFileField(errors, "sarsNoticeOfRegistration", documents.sarsNoticeOfRegistration, true);
  validateFileField(errors, "proofOfAddress", documents.proofOfAddress, true);
  validateFileField(errors, "bankConfirmationLetter", documents.bankConfirmationLetter, true);
  validateFileField(errors, "suretyshipDoc", documents.suretyshipDoc, false);
  return errors;
}

export function validateCredit(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { credit } = data;
  requireField(errors, "creditLimitRequested", credit.creditLimitRequested);
  if (!credit.suretyshipAgreement) {
    errors.suretyshipAgreement = "This confirmation is required to proceed";
  }
  return errors;
}

export function validateDeclarationAndConsent(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { declaration, consent } = data;
  requireField(errors, "signatureFullName", declaration.signatureFullName, "Type your full name to sign");
  requireField(errors, "signatureDate", declaration.signatureDate, "Select the date");
  if (!consent.accurateInfo) {
    errors.accurateInfo = "You must confirm the information is accurate";
  }
  if (!consent.popiConsent) {
    errors.popiConsent = "You must consent to POPI Act processing";
  }
  return errors;
}
