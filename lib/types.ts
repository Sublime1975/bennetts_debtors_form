export type EntityType = "(Pty) Ltd" | "CC" | "Sole Proprietor" | "Partnership" | "Trust";

export type BbeeLevel =
  | "Level 1"
  | "Level 2"
  | "Level 3"
  | "Level 4"
  | "Level 5"
  | "Level 6"
  | "Level 7"
  | "Level 8"
  | "Exempt"
  | "Non-compliant";

export type AccountType = "Current/Cheque" | "Savings";

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
  file: File | null;
}

export interface Director {
  fullName: string;
  idNumber: string;
  residentialAddress: string;
  idDocument: UploadedFileMeta | null;
  suretyshipAgreed: boolean;
  suretyshipSignature: string;
  suretyshipDate: string;
  suretyshipDrawnSignature: string | null;
}

export interface TradeReference {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface CompanyDetails {
  tradingName: string;
  registeredName: string;
  website: string;
  entityType: EntityType | string | "";
  isForeignEntity: boolean | null;
  cipcNumber: string;
  countryOfRegistration: string;
  foreignRegistrationNumber: string;
}

export interface ContactDetails {
  country: string;
  accountsContactName: string;
  accountsEmail: string;
  accountsPhone: string;
  accountsCell: string;
  accountsPhysicalAddress: string;
  accountsPostalAddress: string;
  accountsPostalSameAsPhysical: boolean;
  buyerContactDifferent: boolean;
  buyerContactName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCell: string;
}

export interface ReferencesDetails {
  tradeRef1: TradeReference;
  tradeRef2: TradeReference;
}

export interface TaxDetails {
  vatRegistered: boolean | null;
  vatNumber: string;
  incomeTaxNumber: string;
  bbeeLevel: BbeeLevel | "";
}

export interface BankingDetails {
  isForeignBank: boolean;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  accountType: AccountType | "";
  swiftCode: string;
  bankCountry: string;
  bankAddress: string;
}

export interface DocumentsDetails {
  cipcCertificate: UploadedFileMeta | null;
  vatCertificate: UploadedFileMeta | null;
  vatNoticeOfRegistration: UploadedFileMeta | null;
  sarsNoticeOfRegistration: UploadedFileMeta | null;
  bbeeCertificate: UploadedFileMeta | null;
  bankConfirmationLetter: UploadedFileMeta | null;
}

export interface CreditDetails {
  creditLimitRequested: string;
  estimatedMonthlyPurchase: string;
  paymentTermsRequested: string;
}

export interface DeclarationDetails {
  signatureFullName: string;
  signatureDate: string;
}

export interface ConsentDetails {
  accurateInfo: boolean;
  popiConsent: boolean;
}

export interface AppFormData {
  company: CompanyDetails;
  contact: ContactDetails;
  directors: Director[];
  references: ReferencesDetails;
  tax: TaxDetails;
  banking: BankingDetails;
  documents: DocumentsDetails;
  credit: CreditDetails;
  declaration: DeclarationDetails;
  consent: ConsentDetails;
}

export type StepId =
  | "welcome"
  | "company"
  | "contact"
  | "directors"
  | "references"
  | "tax"
  | "banking"
  | "documents"
  | "credit"
  | "suretyship"
  | "review"
  | "confirmation";

export type FieldErrors = Record<string, string>;
