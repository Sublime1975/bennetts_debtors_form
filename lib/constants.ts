import { AccountType, BbeeLevel, EntityType, StepId } from "./types";

export const STEP_ORDER: StepId[] = [
  "welcome",
  "company",
  "contact",
  "directors",
  "references",
  "tax",
  "banking",
  "documents",
  "credit",
  "review",
  "confirmation",
];

// Steps that show the pill progress indicator (Review and the bookend
// Welcome/Confirmation screens are intentionally excluded).
export const DATA_STEPS: StepId[] = [
  "company",
  "contact",
  "directors",
  "references",
  "tax",
  "banking",
  "documents",
  "credit",
];

export const ENTITY_TYPES: EntityType[] = ["Pty Ltd", "CC", "Sole Proprietor", "Partnership", "Trust"];

export const BBEE_LEVELS: BbeeLevel[] = [
  "Level 1",
  "Level 2",
  "Level 3",
  "Level 4",
  "Level 5",
  "Level 6",
  "Level 7",
  "Level 8",
  "Exempt",
  "Non-compliant",
];

export const ACCOUNT_TYPES: AccountType[] = ["Current/Cheque", "Savings"];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export const STEP_TITLES: Partial<Record<StepId, string>> = {
  company: "Company details",
  contact: "Contact details",
  directors: "Directors & members",
  references: "Trade & bank references",
  tax: "Tax & compliance",
  banking: "Banking details",
  documents: "Document uploads",
  credit: "Credit application terms",
  review: "Review & declaration",
};
