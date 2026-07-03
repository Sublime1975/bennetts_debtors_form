import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "./constants";
import { AppFormData, Director, FieldErrors, UploadedFileMeta } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SA_PHONE_RE = /^(\+27|0)[1-9]\d{8}$/;
// Loose E.164-style check for contacts/banks outside South Africa.
const GENERIC_PHONE_RE = /^\+?[1-9]\d{7,14}$/;
const SA_ID_RE = /^\d{13}$/;
// SA VAT numbers are always exactly 10 digits and always start with 4.
const VAT_RE = /^4\d{9}$/;
// SA income tax reference numbers are 10 digits, starting with 0, 1, 2, 3 or 9.
const INCOME_TAX_RE = /^[01239]\d{9}$/;
const CIPC_RE = /^\d{4}\/\d{6}\/\d{2}$/;
const BRANCH_CODE_RE = /^\d{6}$/;
const ACCOUNT_NUMBER_RE = /^\d{6,16}$/;
const SWIFT_RE = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

function isPhoneValid(phone: string, isLocal: boolean): boolean {
  const stripped = phone.replace(/[\s-]/g, "");
  return isLocal ? SA_PHONE_RE.test(stripped) : SA_PHONE_RE.test(stripped) || GENERIC_PHONE_RE.test(stripped);
}

function requireField(errors: FieldErrors, key: string, value: string, message = "This field is required") {
  if (!value || value.trim() === "") {
    errors[key] = message;
  }
}

// SA ID numbers carry a Luhn check digit (same algorithm as card numbers).
function isValidSaIdChecksum(id: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = id.length - 1; i >= 0; i--) {
    let digit = parseInt(id[i], 10);
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function validateCompany(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { company } = data;
  requireField(errors, "tradingName", company.tradingName);
  requireField(errors, "entityType", company.entityType, "Select an entity type");

  if (company.isForeignEntity === null) {
    errors.isForeignEntity = "Select whether this is a local or foreign entity";
  } else if (company.isForeignEntity) {
    requireField(errors, "countryOfRegistration", company.countryOfRegistration);
    requireField(errors, "foreignRegistrationNumber", company.foreignRegistrationNumber);
  } else {
    requireField(errors, "cipcNumber", company.cipcNumber);
    if (company.cipcNumber && !CIPC_RE.test(company.cipcNumber)) {
      errors.cipcNumber = "Enter a valid CIPC number, e.g. 2020/123456/07";
    }
  }
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
  const isLocalContact = contact.country === "South Africa" || contact.country === "";
  if (contact.phone && !isPhoneValid(contact.phone, isLocalContact)) {
    errors.phone = isLocalContact ? "Enter a valid South African phone number" : "Enter a valid phone number";
  }
  requireField(errors, "physicalAddress", contact.physicalAddress);
  requireField(errors, "country", contact.country, "Select a country");

  if (contact.accountsContactDifferent) {
    requireField(errors, "accountsContactName", contact.accountsContactName);
    requireField(errors, "accountsEmail", contact.accountsEmail);
    if (contact.accountsEmail && !EMAIL_RE.test(contact.accountsEmail)) {
      errors.accountsEmail = "Enter a valid email address";
    }
    requireField(errors, "accountsPhone", contact.accountsPhone);
    if (contact.accountsPhone && !isPhoneValid(contact.accountsPhone, isLocalContact)) {
      errors.accountsPhone = isLocalContact ? "Enter a valid South African phone number" : "Enter a valid phone number";
    }
  }
  return errors;
}

function validateDirector(director: Director, index: number, errors: FieldErrors) {
  requireField(errors, `directors.${index}.fullName`, director.fullName);
  requireField(errors, `directors.${index}.idNumber`, director.idNumber);
  if (director.idNumber) {
    if (!SA_ID_RE.test(director.idNumber)) {
      errors[`directors.${index}.idNumber`] = "Enter a valid 13-digit SA ID number";
    } else if (!isValidSaIdChecksum(director.idNumber)) {
      errors[`directors.${index}.idNumber`] = "This doesn't look like a valid SA ID number";
    }
  }
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

  (["tradeRef1", "tradeRef2"] as const).forEach((key) => {
    const ref = references[key];
    requireField(errors, `${key}.companyName`, ref.companyName);
    requireField(errors, `${key}.contactPerson`, ref.contactPerson);
    requireField(errors, `${key}.phone`, ref.phone);
    if (ref.phone && !isPhoneValid(ref.phone, false)) {
      errors[`${key}.phone`] = "Enter a valid phone number";
    }
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
    if (tax.vatNumber && !VAT_RE.test(tax.vatNumber)) {
      errors.vatNumber = "VAT number must be exactly 10 digits and start with 4";
    }
  }
  requireField(errors, "incomeTaxNumber", tax.incomeTaxNumber);
  if (tax.incomeTaxNumber && !INCOME_TAX_RE.test(tax.incomeTaxNumber)) {
    errors.incomeTaxNumber = "Income tax number must be 10 digits, starting with 0, 1, 2, 3 or 9";
  }
  requireField(errors, "bbeeLevel", tax.bbeeLevel, "Select a B-BBEE level");
  return errors;
}

export function validateBanking(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { banking } = data;
  requireField(errors, "accountHolder", banking.accountHolder);
  requireField(errors, "bankName", banking.bankName);
  requireField(errors, "accountNumber", banking.accountNumber);

  if (banking.isForeignBank) {
    requireField(errors, "bankCountry", banking.bankCountry);
    requireField(errors, "swiftCode", banking.swiftCode);
    if (banking.swiftCode && !SWIFT_RE.test(banking.swiftCode.replace(/\s/g, "").toUpperCase())) {
      errors.swiftCode = "Enter a valid 8 or 11 character SWIFT/BIC code";
    }
  } else {
    if (banking.accountNumber && !ACCOUNT_NUMBER_RE.test(banking.accountNumber)) {
      errors.accountNumber = "Account number must be 6-16 digits";
    }
    requireField(errors, "branchCode", banking.branchCode);
    if (banking.branchCode && !BRANCH_CODE_RE.test(banking.branchCode)) {
      errors.branchCode = "Branch code must be exactly 6 digits";
    }
    requireField(errors, "accountType", banking.accountType, "Select an account type");
  }
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
  return errors;
}

export function validateCredit(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { credit } = data;
  requireField(errors, "creditLimitRequested", credit.creditLimitRequested);
  if (credit.creditLimitRequested) {
    const limit = Number(credit.creditLimitRequested);
    if (!Number.isFinite(limit) || limit <= 0) {
      errors.creditLimitRequested = "Enter a valid credit limit greater than 0";
    }
  }
  if (credit.estimatedMonthlyPurchase) {
    const volume = Number(credit.estimatedMonthlyPurchase);
    if (!Number.isFinite(volume) || volume < 0) {
      errors.estimatedMonthlyPurchase = "Enter a valid amount";
    }
  }
  return errors;
}

function isSameName(a: string, b: string): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  return normalize(a) === normalize(b) && normalize(a).length > 0;
}

export function validateSuretyship(directors: Director[]): FieldErrors {
  const errors: FieldErrors = {};
  directors.forEach((director, index) => {
    if (!director.suretyshipAgreed) {
      errors[`suretyship.${index}.agreed`] = "This director/member must agree to the suretyship terms";
    }
    requireField(errors, `suretyship.${index}.signature`, director.suretyshipSignature, "Type your full name to sign");
    if (director.suretyshipSignature && !isSameName(director.suretyshipSignature, director.fullName)) {
      errors[`suretyship.${index}.signature`] = "Signature must match this director's full name exactly";
    }
    requireField(errors, `suretyship.${index}.date`, director.suretyshipDate, "Select the date");
    if (director.suretyshipDate) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (new Date(director.suretyshipDate) > today) {
        errors[`suretyship.${index}.date`] = "Signature date cannot be in the future";
      }
    }
  });
  return errors;
}

export function validateDeclarationAndConsent(data: AppFormData): FieldErrors {
  const errors: FieldErrors = {};
  const { declaration, consent } = data;
  requireField(errors, "signatureFullName", declaration.signatureFullName, "Type your full name to sign");
  requireField(errors, "signatureDate", declaration.signatureDate, "Select the date");
  if (declaration.signatureDate) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (new Date(declaration.signatureDate) > today) {
      errors.signatureDate = "Signature date cannot be in the future";
    }
  }
  if (!consent.accurateInfo) {
    errors.accurateInfo = "You must confirm the information is accurate";
  }
  if (!consent.popiConsent) {
    errors.popiConsent = "You must consent to POPI Act processing";
  }
  return errors;
}
