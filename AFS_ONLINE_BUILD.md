# AFS Online — Design Specification & Build Plan

**Version:** 1.1
**Date:** 18 July 2026
**Owner:** Terry (Bennetts)
**Status:** Approved for build — v1 scope locked per Q&A of 18 Jul 2026

**v1.1 changes:** lead sheets respecified as Draftworx/CaseWare-style lead
schedules with account-level breakdown and drill-down (§A10); note templates and
AFS look now explicitly sourced from owner-supplied notes/examples (§A8.1, Part C);
Close Corporations earmarked for v2 with `entityType` reserved in the data model
(§A3.4, §A14).

---

## 0. How to use this document

This is the single source of truth for building **AFS Online**, a web-based financial
statement drafting tool. It has three parts:

- **Part A — Design Specification:** what the product is, how it works, data model,
  screens, engines, output. Read fully before writing any code.
- **Part B — Phased Build Plan:** numbered phases written as instructions for AI build
  agents (Claude Code). Each phase has tasks, acceptance criteria, and a **review gate**
  that must pass before the next phase starts.
- **Part C — Inputs needed from the product owner:** things the build must *ask Terry
  for* at specific points (example AFS PDFs, firm details, sample trial balances).
  **Do not invent these — ask.**

Sections marked **[NEW]** were designed fresh for this document (they were not in the
original design transcript, which ended mid-way through the working papers section).
Everything else consolidates and, where noted, corrects the transcript.

### Rules for build agents

1. Follow the phase order. Do not start a phase before the previous phase's review
   gate has passed.
2. Every phase ends with a review pass by a second agent (or a fresh-context pass):
   check the output against the phase's acceptance criteria — not against "looks fine".
3. Accounting logic is specified in Part A. If an accounting question is not answered
   there, **stop and ask the product owner** (a chartered-accountant-level user).
   Never guess disclosure wording, tax rules, or statement structure.
4. All amounts in the system are stored as numbers in cents-precision decimals
   (JavaScript `number` is acceptable for v1; round to 2dp at every write). Displayed
   AFS figures are whole Rands (see §A6.6 rounding).
5. Debits are positive, credits are negative, everywhere in storage (see §A3.1).
   Presentation-layer sign flipping happens only in the statement engine.

---

# PART A — DESIGN SPECIFICATION

## A1. Product overview

### A1.1 What it is

AFS Online turns a trial balance into a professional, bank-ready set of Annual
Financial Statements (AFS) or monthly management accounts, online, in under 30 minutes
once a company is set up. The user is a **company accountant / practice drafting for
companies** — not an audit firm. There is no audit-methodology bloat: the workflow is
TB in → map → adjust → statements + notes → lead sheets with working-paper evidence →
PDF out (print or email).

**Working model:** the drafting workflow deliberately mirrors Draftworx and
CaseWare Working Papers — import a TB, map it to a standard chart, work off a
working trial balance with drill-down, and support each statement area with a
**lead schedule** that breaks the FS line down to its GL accounts — but strips
out everything audit-shaped: no audit programmes, no assurance procedures, no
tickmark methodology, no complex full-IFRS disclosure engine. Evidence is simply
Excel workings and PDFs attached below each lead schedule.

### A1.2 The core loop

```
Import TB → Map accounts → Post adjustments → Review statements & notes
   → Attach working papers to lead sheets → Generate PDF → Email/print
   → Close period → Roll forward → next period reuses everything
```

The differentiator is **continuity**: mappings, layouts, note selections, adjustment
patterns and styling are remembered per company, so month 2 / year 2 is a 30-minute
job instead of a rebuild.

### A1.3 v1 scope (locked)

**In:**
- Excel (.xlsx/.xls) and CSV trial balance import only. No live API integrations.
- One reporting framework: **IFRS for SMEs**.
- One country/currency focus: **South Africa / ZAR** (currency stored per org so
  others work, but templates, tax note and terminology are SA-first).
- Yearly AFS **and** monthly management accounts, with month-end / year-end close.
- Full SA AFS pack (see §A6): cover page, index, directors' responsibility statement,
  compilation report, directors' report, SoFP, SoCI, SoCE, statement of cash flows
  (indirect method), accounting policies, notes **including a tax computation note
  with user-added add-backs**, and a detailed income statement as a supplementary
  schedule.
- Comparatives via **prior-year final TB import or manual entry — both supported**.
- Lead sheets with Excel/PDF working papers, right-click upload, auto-numbering.
- Firebase Auth + Firestore + Firebase Storage backend.
- PDF generation, email delivery, report history.
- **Internal-first, SaaS-ready:** v1 auth is simple (email/password + Google), every
  user effectively has full access, but all data is keyed by `orgId`/`uid` and the
  role field exists, so multi-tenant roles/invitations/billing bolt on later without
  a data migration.

**Out (earmarked for later — design must not block these, but build nothing for them):**
- Sage/Xero/QuickBooks live APIs (Excel exports from those systems are the v1 path).
- Full IFRS and FRS 102 frameworks; multi-language; XBRL.
- Consolidations / group accounts.
- Multi-user roles, invitations, viewer access for banks/auditors.
- Pricing, payments, Stripe.
- Automatic deferred-tax computation (v1: manual deferred tax line, see §A8.5).

### A1.4 Success criteria for v1 (the whole build is judged against these)

1. Import a real Sage/Pastel-style TB export (Excel) for a test company; map it;
   post at least depreciation + one accrual; and produce a complete AFS PDF whose
   SoFP balances, whose SoCE retained earnings ties to SoCI profit, and whose cash
   flow reconciles to the actual bank movement — with zero unexplained differences.
2. Roll that company into the next period; the second period's TB import requires
   no re-mapping for unchanged accounts and reaches PDF in under 30 minutes.
3. The AFS PDF is white-page/black-text, matches the page order in §A6.1, and its
   layout survives comparison against the example AFS PDFs supplied by the product
   owner (see Part C — these must be requested before Phase 5).

---

## A2. Architecture & tech stack

### A2.1 High-level architecture

```
CLIENT (Next.js on Firebase Hosting)
  ├── React app: all screens (Part A5)
  ├── Client-side Excel/CSV parsing (SheetJS)
  └── Firestore SDK (direct reads/writes under security rules)

FIREBASE
  ├── Auth        — email/password + Google sign-in
  ├── Firestore   — all structured data (§A3)
  ├── Storage     — logos, working papers (xlsx/pdf/images), generated PDFs
  └── Cloud Functions (2nd gen)
        ├── generatePdf   — renders AFS pack HTML → PDF (Puppeteer)
        ├── sendReport    — emails a generated PDF (Resend)
        └── onPeriodClose — snapshot + lock housekeeping

FUTURE (earmarked, no code in v1)
  └── Sage/Xero/QuickBooks connectors, Stripe billing
```

### A2.2 Stack (locked)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js (App Router), static-export/CSR pages served from Firebase Hosting | Use the current stable major at build time |
| Language | TypeScript, `strict: true` | Non-negotiable |
| Styling | Tailwind CSS | Design tokens in §A5.1 |
| UI components | shadcn/ui (Radix primitives) | Copy-in ownership |
| Client state | Zustand | Current org/period, UI state |
| Server state | TanStack Query over Firestore SDK | Cache TB/statements per period |
| Forms | React Hook Form + Zod | All setup & adjustment forms |
| Data grid | AG Grid Community | TB view/edit, mapping screen |
| Spreadsheet parse | SheetJS (xlsx) | Client-side import + working-paper Excel preview |
| PDF viewer | pdf.js | Working-paper PDF preview |
| Backend | Firebase Cloud Functions 2nd gen (Node) | Only for PDF gen + email + close hooks |
| Database | Firestore | Schema in §A3 |
| Auth | Firebase Auth | Email/password + Google |
| Storage | Firebase Storage | Path scheme in §A3.9 |
| PDF generation | Puppeteer in a Cloud Function | Renders the same HTML the FS tab shows |
| Email | Resend | Attachment = generated PDF |
| Hosting | Firebase Hosting | Custom domain later |

**Note on the transcript's earlier stack (PostgreSQL/Node):** superseded. The product
owner's instruction is Firebase/Firestore + Firebase Auth. This is final for v1.

### A2.3 Why client-side import parsing

TB files are small (hundreds to low thousands of rows). Parsing in the browser with
SheetJS avoids a round trip, gives instant preview/validation, and keeps Cloud
Function usage (and cost) near zero. The parsed, validated line items are what get
written to Firestore — the original file is also uploaded to Storage for audit trail.

---

## A3. Data model (Firestore)

### A3.1 Conventions

- **Sign convention:** every stored monetary amount is a signed number: debit
  positive, credit negative. A TB line has a single `balance` field (plus the raw
  `debit`/`credit` as imported for display). All engines (statements, notes, cash
  flow, lead sheets) work off `balance`. Presentation sign (e.g. showing liabilities
  as positive numbers) is applied only at render time by the statement engine.
- **IDs:** Firestore auto-IDs everywhere; human references (`AJ001`, `LS-001`,
  `WP-001`) are fields, not document IDs.
- **Timestamps:** Firestore `Timestamp`; `createdAt`/`updatedAt` on every document.
- **Denormalisation:** period documents carry status flags (tbImported,
  statementsGenerated, …) so the tab bar can render without subcollection reads.

### A3.2 Collection tree

```
users/{uid}
organizations/{orgId}
  settings/main                      ← single settings doc
  mappings/current                   ← the org's remembered account→target map
  periods/{periodId}
    trialBalance/main                ← one TB doc per period (line items array)
    adjustments/{adjId}
    statements/{stmtId}              ← generated statement snapshots
    notes/{noteId}
    taxComputation/main              ← the tax note's computation [NEW]
    leadSheets/{lsId}
      workingPapers/{wpId}
    reports/{reportId}
templates/{templateId}               ← global statement/note templates (read-only to clients)
mappingTargets/{targetId}            ← global standard chart of mapping targets (read-only)
```

### A3.3 users/{uid}

```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  organizations: string[];          // org IDs this user can access
  preferences: {
    theme: 'light' | 'dark' | 'system';
    dateFormat: string;             // default 'DD/MM/YYYY'
  };
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}
// v1: every listed user has full access to their orgs. A `role` map is added
// in the multi-user phase (earmarked) — do not build role UI in v1.
```

### A3.4 organizations/{orgId}

```typescript
interface Organization {
  id: string;
  entityType: 'company';            // v2 widens to | 'cc' (Close Corporation):
                                    // members instead of directors, member's
                                    // interest instead of share capital,
                                    // accounting officer's report. Reserved now
                                    // so v2 needs no data migration.
  name: string;                     // "ABC Trading (Pty) Ltd"
  tradingName?: string;
  registrationNumber: string;       // "2018/123456/07"
  taxNumber: string;                // income tax reference
  vatRegistered: boolean;
  vatNumber?: string;
  industry?: string;
  natureOfBusiness: string;         // sentence used in directors' report & note 1
  country: string;                  // default 'ZA'
  currency: string;                 // default 'ZAR'
  address: { street: string; city: string; province: string; postalCode: string; country: string };
  contact: { phone?: string; email?: string };
  logoStoragePath?: string;
  directors: { name: string; title?: string; appointedDate?: string; isSignatory: boolean }[];
  companySecretary?: string;
  // Compiler / accounting officer details for the compilation report [NEW]
  compiler: {
    firmName: string;               // e.g. "Bennetts"
    practitionerName: string;
    designation: string;            // e.g. "Professional Accountant (SA)"
    practiceNumber?: string;
    address?: string;
  };
  framework: 'IFRS_SME';            // union widens later
  reportingFrequency: 'monthly' | 'yearly';
  financialYearEnd: { month: number; day: number };   // e.g. { month: 2, day: 28 }
  ownerUid: string;
  lastPeriodId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### A3.5 organizations/{orgId}/settings/main

Everything here is **remembered across periods** — this is the continuity feature.

```typescript
interface OrgSettings {
  afsLayout: {
    pageSize: 'A4';
    fontFamily: 'Georgia' | 'Times' | 'Inter';   // default 'Georgia' for statements
    fontSizePt: number;                          // default 11
    negativeFormat: 'brackets';                  // v1 fixed: (1,234) style
    rounding: 'rand';                            // whole Rands on the face (§A6.6)
    showLogoOnCover: boolean;
    footerText?: string;
  };
  style: 'standard_white' | 'premium' | 'minimal';   // default standard_white (§A6.7)
  monthlyPack: {                                  // configurable per company [NEW]
    statements: ('sofp' | 'soci' | 'soce' | 'cash_flow' | 'detailed_is')[];
    // default: ['sofp', 'soci']
    comparativeColumn: 'prior_month' | 'prior_year_same_month' | 'ytd';
  };
  yearEndPack: {
    // which optional sections are included; core statements always included
    include: {
      coverAndIndex: boolean;            // default true
      directorsResponsibility: boolean;  // default true
      compilationReport: boolean;        // default true
      directorsReport: boolean;          // default true
      cashFlow: boolean;                 // default true
      detailedIncomeStatement: boolean;  // default true
    };
  };
  noteSelections: {                    // remembered note on/off switches
    [noteTemplateId: string]: { enabled: boolean; customTitle?: string };
  };
  workingPaperNumbering: { prefix: string; separator: string; pad: number };
  // default { prefix: 'WP', separator: '-', pad: 3 }  →  WP-001
  leadSheetReferencing: 'numeric' | 'section_letter';   // §A10.2, default 'numeric'
  emailDefaults: { subject: string; body: string; recipients: string[] };
  updatedAt: Timestamp;
}
```

### A3.6 organizations/{orgId}/mappings/current

```typescript
interface OrgMappings {
  entries: {
    accountCode: string;            // key from the client's TB
    accountName: string;            // last seen name (for display + fuzzy rematch)
    targetId: string;               // mappingTargets id (§A3.12)
    confirmedBy: string;            // uid
    confirmedAt: Timestamp;
  }[];
  updatedAt: Timestamp;
}
// One doc per org. On each new TB import, accounts are matched by accountCode
// first, then by exact name, then fuzzy-suggested (§A5.5). Confirmed matches
// are written back here — this is what makes roll-forward instant.
```

### A3.7 periods/{periodId}

```typescript
interface Period {
  id: string;
  orgId: string;
  name: string;                     // "FY2026" | "June 2026"
  type: 'yearly' | 'monthly';
  year: number;
  month?: number;                   // 1–12 for monthly
  startDate: Timestamp;
  endDate: Timestamp;
  isYearEnd: boolean;               // year-end close → full AFS pack
  status: 'draft' | 'in_progress' | 'final' | 'closed';
  // Progress flags for tab enable/badge logic:
  tbImported: boolean;
  mappingComplete: boolean;
  statementsGenerated: boolean;
  // Comparatives (§A6.5):
  comparativeSource: 'prior_period' | 'imported_tb' | 'manual' | 'none';
  comparativePeriodId?: string;     // when prior period exists in-system
  rolledForwardFrom?: string;
  isLocked: boolean;                // closed periods are read-only (rules-enforced)
  lockedAt?: Timestamp;
  lockedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### A3.8 periods/{periodId}/trialBalance/main

```typescript
interface TrialBalance {
  importSource: 'excel' | 'csv' | 'manual';
  importFileName?: string;
  importFileStoragePath?: string;   // original file kept for audit trail
  importedAt: Timestamp;
  importedBy: string;
  lineItems: TBLineItem[];
  totals: { totalDebits: number; totalCredits: number; difference: number };
  updatedAt: Timestamp;
}

interface TBLineItem {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;                    // as imported (>= 0)
  credit: number;                   // as imported (>= 0)
  balance: number;                  // debit - credit (signed, storage convention)
  targetId?: string;                // resolved mapping target
  mappingConfidence?: number;       // 0–1 when auto-suggested, 1 when confirmed
  isMapped: boolean;
  isNewAccount: boolean;            // not seen in org mappings before
}
// The "final TB" is not stored separately: final balance per account =
// TB balance + sum of posted adjustment lines hitting that account.
// The UI offers a computed Final TB view/export (§A5.4).
```

### A3.9 Storage path scheme

```
orgs/{orgId}/logo/{filename}
orgs/{orgId}/periods/{periodId}/tb-imports/{filename}
orgs/{orgId}/periods/{periodId}/working-papers/{wpId}/{filename}
orgs/{orgId}/periods/{periodId}/adjustment-support/{adjId}/{filename}
orgs/{orgId}/periods/{periodId}/reports/{reportId}.pdf
```

### A3.10 adjustments/{adjId}

```typescript
interface Adjustment {
  id: string;
  reference: string;                // "AJ001" — auto-incremented per period
  description: string;
  type: 'accrual' | 'prepayment' | 'depreciation' | 'provision'
      | 'reclassification' | 'correction' | 'tax' | 'other';
  date: Timestamp;                  // effective date (usually period end)
  lines: {
    id: string;
    accountCode: string;            // existing TB account OR a new account created here
    accountName: string;
    targetId: string;               // every adjustment line must be mapped
    debit: number; credit: number;
  }[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;              // unbalanced adjustments cannot be posted
  status: 'draft' | 'posted' | 'reversed';
  willAutoReverse: boolean;         // if true, roll-forward creates the reversal
  reversesAdjustmentId?: string;
  supportingDocument?: { name: string; storagePath: string };
  createdBy: string;
  createdAt: Timestamp;
  postedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

### A3.11 statements, notes, tax computation, lead sheets, reports

```typescript
// statements/{stmtId} — a generated snapshot of one statement
interface Statement {
  id: string;
  type: 'sofp' | 'soci' | 'soce' | 'cash_flow' | 'detailed_is';
  templateId: string; templateVersion: string;
  lines: StatementLine[];           // fully computed, ready to render
  totalsCheck: { balanced: boolean; difference: number };  // e.g. SoFP A = E+L
  status: 'draft' | 'final';
  generatedAt: Timestamp; generatedBy: string;
  manualComparatives?: { [lineId: string]: number };  // when comparativeSource='manual'
}

interface StatementLine {
  id: string;                       // template line id
  description: string;
  current: number;                  // presentation-signed, whole Rands
  comparative?: number;
  noteRef?: string;                 // "3" → rendered as note column entry
  isBold: boolean; indentLevel: number; isTotal: boolean;
  sourceTargetIds: string[];        // drill-down: which mapping targets feed this line
}

// notes/{noteId} — one instantiated note per period
interface NoteInstance {
  id: string;
  templateId: string;               // from global note templates
  noteNumber: number;               // assigned at pack assembly (§A8.2)
  title: string;
  enabled: boolean;                 // auto-set by applicability rule; user can toggle
  autoApplicable: boolean;          // what the rule said (kept even if user overrides)
  blocks: NoteBlock[];              // text paragraphs (editable) + tables (computed)
  isEdited: boolean;
  updatedAt: Timestamp;
}

interface NoteBlock {
  id: string;
  type: 'paragraph' | 'table';
  order: number;
  text?: string;                    // paragraphs: fully editable rich-ish text
  table?: {
    headers: string[];
    rows: { label: string; values: (number | string)[]; computed: boolean }[];
  };
  cellOverrides?: { [rowIdx_colIdx: string]: number };  // user override + warning flag
}

// taxComputation/main — feeds the tax note [NEW], see §A8.5
interface TaxComputation {
  profitBeforeTax: number;          // pulled from SoCI (read-only here)
  addBacks:    { id: string; description: string; amount: number }[];
  deductions:  { id: string; description: string; amount: number }[];
  assessedLossBroughtForward: number;
  taxableIncome: number;            // computed
  taxRate: number;                  // default 0.27, editable
  currentTax: number;               // computed
  deferredTaxMovement: number;      // manual entry in v1
  notes?: string;
  updatedAt: Timestamp;
}

// leadSheets/{lsId} — §A10 (Draftworx/CaseWare-style lead schedule)
interface LeadSheet {
  id: string;
  reference: string;                // "LS-001" (or section letter "B" — §A10.2)
  title: string;                    // FS line description
  fsLineId: string;                 // statement template line it supports
  // Account-level breakdown: the GL accounts behind this FS line (drill-down),
  // recomputed from TB + adjustments on regenerate — the core lead schedule body.
  accounts: {
    accountCode: string; accountName: string;
    tbBalance: number;              // unadjusted, current period
    adjustmentsTotal: number;       // posted adjustment lines on this account
    finalBalance: number;
    priorYear?: number;             // comparative final balance
  }[];
  reconciliation: {
    tbBalance: number;              // Σ accounts.tbBalance
    adjustments: { adjId: string; reference: string; description: string; amount: number }[];
    fsBalance: number;              // FS line amount
    difference: number;             // must be 0 to show "Reconciled"
  };
  status: 'draft' | 'completed';
  updatedAt: Timestamp;
}

// leadSheets/{lsId}/workingPapers/{wpId}
interface WorkingPaper {
  id: string;
  reference: string;                // "WP-001" — next logical number, per lead sheet
  title: string;
  fileName: string;
  storagePath: string;
  fileType: 'excel' | 'pdf' | 'image';
  fileSize: number;
  order: number;                    // display order below the lead sheet
  attachedToWpId?: string;          // a PDF attached *under* another WP (§A10.4)
  uploadedBy: string;
  uploadedAt: Timestamp;
}

// reports/{reportId} — §A13
interface GeneratedReport {
  id: string;
  name: string;                     // "FY2026 Annual Financial Statements"
  packType: 'afs_full' | 'management_accounts' | 'custom';
  includedSections: string[];
  style: 'standard_white' | 'premium' | 'minimal';
  pdfStoragePath: string;
  pageCount: number;
  status: 'generating' | 'ready' | 'failed';
  errorMessage?: string;
  emailHistory: { sentAt: Timestamp; sentBy: string; recipients: string[]; subject: string; status: string }[];
  generatedAt: Timestamp; generatedBy: string;
}
```

### A3.12 mappingTargets (global standard chart) [NEW — critical]

The mapping target list is the backbone: every TB account maps to exactly one target;
every statement line, note table and cash-flow classification is defined in terms of
targets. It ships as seed data (see Appendix 1 for the full v1 list). Shape:

```typescript
interface MappingTarget {
  id: string;                       // stable code, e.g. 'ppe_vehicles_cost'
  name: string;                     // "Motor vehicles — cost"
  group: string;                    // "Property, plant and equipment"
  statement: 'sofp' | 'soci';
  fsLine: string;                   // statement template line id it rolls into
  noteTable?: { noteTemplateId: string; column: string; row: string };
  cashFlowClass: 'operating_wc' | 'operating_noncash' | 'investing'
               | 'financing' | 'cash' | 'tax' | 'dividends' | 'none';
  normalSide: 'debit' | 'credit';   // used to flag unusual balances, not to block
  detailedIsSection?: string;       // where it appears on the detailed income statement
  sortOrder: number;
}
```

---

## A4. Authentication & security

### A4.1 v1 auth

- Firebase Auth: **email/password** (with email verification) and **Google sign-in**.
- New sign-ups are allowed but see an empty dashboard; they can create organisations.
  (Internal use first — no invitation system, no role UI in v1.)
- Session handling entirely via the Firebase SDK; no custom tokens.

### A4.2 Firestore security rules (v1)

Simplified from the transcript to match "internal first, SaaS-ready":

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function memberOf(orgId) {
      return signedIn() &&
        orgId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizations;
    }
    function periodUnlocked(orgId, periodId) {
      return get(/databases/$(database)/documents/organizations/$(orgId)/periods/$(periodId)).data.isLocked == false;
    }

    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /organizations/{orgId} {
      allow read, update: if memberOf(orgId);
      allow create: if signedIn();
      allow delete: if memberOf(orgId);   // tightens to owner-only in multi-user phase
      match /settings/{doc} { allow read, write: if memberOf(orgId); }
      match /mappings/{doc} { allow read, write: if memberOf(orgId); }
      match /periods/{periodId} {
        allow read, create: if memberOf(orgId);
        allow update: if memberOf(orgId);   // lock flag itself must remain editable to unlock
        allow delete: if memberOf(orgId) && periodUnlocked(orgId, periodId);
        match /{document=**} {
          allow read: if memberOf(orgId);
          allow write: if memberOf(orgId) && periodUnlocked(orgId, periodId);
        }
      }
    }
    match /templates/{id} { allow read: if signedIn(); allow write: if false; }
    match /mappingTargets/{id} { allow read: if signedIn(); allow write: if false; }
  }
}
```

Storage rules mirror this: read/write under `orgs/{orgId}/**` only for members of
that org; templates and seed data are deployed server-side only.

**Locked periods are enforced in rules, not just UI** — this is the audit-trail
guarantee that a closed period's numbers cannot silently change.

---

## A5. Navigation, layout & screens

### A5.1 Global layout & design language

- **Top bar (persistent):** logo · organisation selector · period selector · user
  menu · theme toggle.
- **Tab bar (persistent, horizontal, under top bar), left → right exactly:**

  `Trial Balance | Mapping | Adjustments | Financial Statements | Notes | Lead Sheets | Reports`

  Tabs are the workflow. Trial Balance is leftmost per the product owner's
  requirement. Tab states: disabled (grey, prerequisites unmet), enabled, active
  (accent underline), badged (amber dot = action needed, e.g. unmapped accounts).
- **App design language ("Notion for accountants"):** content-first, generous
  whitespace, progressive disclosure, minimal chrome. App UI font: Inter with
  tabular figures for all numbers. **The AFS document itself does not follow the
  app theme** — it is always its own white-page document style (§A6.7), even in
  dark mode.
- **Tokens:** accent `#2563eb`; success `#16a34a`; danger `#dc2626`; warning
  `#ca8a04`; neutral surface scale `#fafafa` → `#0a0a0a`. Light and dark themes;
  default light.

### A5.2 Dashboard

Organisation cards (logo, name, last period status, `Open` / `Settings`), recent
activity feed (last imports/generations across orgs), `+ New Organisation`.
Quick actions: Import TB · Generate AFS · View Reports.

### A5.3 Organisation setup / settings

Single settings screen, sections: Company information (name, trading name, reg no,
**tax number, VAT registered + VAT number**, industry, nature of business, country,
currency), **logo upload** (drag-drop, preview, remove/replace), address & contact,
**directors** (repeatable rows; mark signatories for the responsibility statement),
**compiler/firm details** (for the compilation report) **[NEW]**, reporting settings
(framework fixed to IFRS for SMEs in v1; **reporting frequency: monthly or yearly;
financial year end month/day**), pack contents (§A3.5 `yearEndPack.include` toggles +
`monthlyPack` statement picker), numbering and email defaults.

Helper copy: *Month-end close produces management accounts. Year-end close produces
the full AFS with notes.*

### A5.4 Trial Balance tab

- Import panel: drag-drop or browse (.xlsx/.xls/.csv), plus `Download Template`.
- **Import wizard [NEW — transcript implied, now specified]:**
  1. Sheet picker (if multiple sheets).
  2. Column mapping: user points at Account Code / Account Name / Debit / Credit
     (or single signed Balance) columns; first-row-is-header toggle. The chosen
     column layout is remembered per org for next time.
  3. Validation preview: row count, total debits/credits, difference. **Import is
     blocked while the TB does not balance** (difference ≠ 0.00) — show the
     difference prominently. Duplicate account codes are flagged and must be
     resolved (merge or rename) before accepting.
  4. Accept → writes `trialBalance/main`, uploads original file to Storage,
     auto-applies remembered mappings, sets `tbImported`.
- Grid view (AG Grid): code, name, debit, credit, mapped-to, status filters,
  search. Inline edit allowed until period lock; edits recompute totals live.
- **Final TB view:** toggle that shows TB + posted adjustments per account with an
  adjustments column; exportable to Excel.
- Re-import replaces the TB after an explicit confirm listing what changes
  (new/removed/changed accounts); posted adjustments are kept.

### A5.5 Mapping tab

- Header: progress (`45/50 accounts mapped`), `Auto-Map Remaining`, `Save`.
- **Unmapped accounts** section on top: each row shows the suggestion (from, in
  order: org mapping by code → org mapping by exact name → fuzzy name match against
  target names and previously seen names, with confidence %) and a target picker
  (searchable, grouped by target group).
- **Mapped accounts** below, collapsed by default; any mapping can be changed.
- Unusual-balance warnings: account balance on the opposite of its target's
  `normalSide` (e.g. bank overdrawn) shows an info flag — never blocks.
- Confirmed mappings write to `mappings/current` (the org memory) **and** the TB
  line items. `mappingComplete` becomes true only when every account with a
  non-zero balance is mapped; the Financial Statements tab stays disabled until then.

### A5.6 Adjustments tab

- Impact summary card pinned on top: unadjusted profit → adjustments impact →
  **adjusted profit**, recomputed live.
- Adjustment cards (per transcript §6.5): reference (auto `AJ001`…), type,
  description, date, line grid (account picker from TB accounts + "create new
  account" inline, which requires choosing a mapping target), debit/credit
  columns with running balance check. **Post is disabled until balanced.**
- Supporting document upload per adjustment.
- `Auto-reverse next period` toggle (accruals/provisions); roll-forward creates
  the reversing entry as a draft in the new period (§A12).
- Posted adjustments feed everything downstream immediately (statements
  regenerate on demand, not on every keystroke — a "Regenerate statements"
  affordance appears when data is stale).

### A5.7 Financial Statements tab

- Sub-tabs: `SoFP | SoCI | SoCE | Cash Flow | Detailed IS` + style selector.
- Renders the statements as **paper**: a white A4-proportioned page, black text,
  serif — exactly what the PDF will look like (same HTML/CSS, §A13.1). This is
  the hero screen.
- Numbers are read-only here (they come from TB + adjustments). Interactions:
  - Click a line → drill-down panel: contributing accounts and adjustments.
  - Note references in the note column link to the Notes tab.
  - Rounding check and SoFP balance check states shown discreetly (§A6.6).
- `Generate PDF` shortcut (jumps to Reports flow).

### A5.8 Notes tab

Two panes:
- **Left — note selection list:** every note template relevant to IFRS for SMEs,
  with checkbox state. Auto-applicable notes are pre-ticked (rule per template,
  §A8.3); zero-balance notes show "(not applicable — zero balance)" but **can be
  ticked on manually**; required notes (accounting policies, tax) cannot be
  unticked. `Auto-Select Applicable` / `Reset to Defaults` / selections persist
  to org settings for next period.
- **Right — note editor** for the selected note:
  - **Paragraph blocks: fully editable** (the product owner's rule: *words
    editable, amounts not*).
  - **Table blocks: computed from targets/adjustments; cells are overridable
    but overriding shows a persistent warning chip "overridden — disconnected
    from source data" with one-click revert.**
  - `Reset to template` per note. `Preview in AFS` renders the note as paper.
- The **tax note** has its own editor backed by `taxComputation/main` (§A8.5).

### A5.9 Lead Sheets tab

Per §A10. List of lead sheet cards; each card = reconciliation block + working
papers listed below it; right-click context menu; `+ Create Lead Sheet`,
`Auto-Generate All`.

### A5.10 Reports tab

Per §A13. `Generate New Report` (pack type, sections, style), report cards with
Preview / Download / Email / Delete, email history per report, and the **Close
Period / Roll Forward** actions live here once a final AFS/pack has been generated.

---

## A6. The AFS document pack [NEW — assembled from Q&A decisions]

### A6.1 Year-end pack: page order

1. **Cover page** — logo (optional), company name, registration number,
   "Annual Financial Statements for the year ended {date}".
2. **Index** — contents with page numbers (computed at PDF time).
3. **General information** — country of incorporation, nature of business,
   directors, registered address, company registration number, tax reference
   number, VAT number (if registered), compiler details, "level of assurance"
   line (compiled, not audited/reviewed) and preparer statement.
4. **Directors' responsibility statement** — standard wording template, names +
   signature lines for signatory directors, date field.
5. **Compilation report** — ISRS 4410 (Revised) compilation engagement wording,
   addressed to the directors, with the compiler's firm details. Fully editable
   text template (firms have house wording).
6. **Directors' report** — nature of business, review of activities/results,
   dividends, directors listing, events after reporting date, going concern
   paragraph. Auto-populated where possible (profit figure, dividend figure,
   director names); every paragraph editable.
7. **Statement of Financial Position**
8. **Statement of Comprehensive Income**
9. **Statement of Changes in Equity**
10. **Statement of Cash Flows** (indirect)
11. **Accounting policies** (Note 1)
12. **Notes to the annual financial statements** (Note 2 onwards, incl. tax note)
13. **Detailed income statement** — supplementary schedule, on its own page,
    headed "The supplementary information presented does not form part of the
    annual financial statements and is unaudited".

Sections 1–6 and 10/13 are individually toggleable in org settings (§A3.5);
7–9, 11–12 always print in a year-end pack.

### A6.2 Statement of Financial Position

Standard IFRS-for-SMEs classified layout: Assets (non-current: PPE, intangibles,
loans receivable, deferred tax asset; current: inventories, trade and other
receivables, current tax receivable, cash and cash equivalents) then Equity and
Liabilities (equity: share capital, retained earnings, shareholder loans if
presented in equity — **no**: shareholder loans are liabilities by default, see
Appendix 1; non-current liabilities: interest-bearing borrowings, deferred tax
liability; current liabilities: trade and other payables, current tax payable,
bank overdraft, current portion of borrowings, provisions). Note column on the
right; current + comparative year columns. Zero lines are suppressed unless the
comparative is non-zero.

### A6.3 SoCI, SoCE, Detailed income statement

- **SoCI** (single statement, by nature or function — v1 by nature): Revenue,
  Cost of sales, Gross profit, Other income, Operating expenses, Operating
  profit, Investment revenue, Finance costs, Profit before taxation, Taxation
  (from tax computation), Profit for the year. Other comprehensive income: v1
  renders the "no OCI" presentation (total comprehensive income = profit)
  unless an OCI-mapped target has a balance, which is out of scope and raises
  a "needs manual attention" flag.
- **SoCE**: columns Share capital · Retained earnings · Total. Rows: opening
  balance, prior period adjustments (if a target is mapped there), profit for
  the year, dividends, share issues, closing balance. Closing retained earnings
  must equal SoFP retained earnings — hard check.
- **Detailed income statement**: Revenue and cost of sales detail, gross profit,
  other income itemised, then **expenses itemised alphabetically** (SA
  convention) from the `detailedIsSection` field of each expense target, then
  finance costs, profit before tax. Shows every expense target with a balance —
  this is the schedule bank managers actually read.

### A6.4 Statement of cash flows — indirect method [NEW — engine spec in §A9]

Cash flows from operating activities (profit before tax, adjusted for non-cash
items: depreciation, amortisation, profit/loss on disposal, movements in
provisions; working-capital changes: inventories, receivables, payables), tax
paid (computed, §A9.3), then investing (PPE/intangible additions & disposal
proceeds, loans advanced/repaid), then financing (borrowings raised/repaid,
shareholder loan movements, dividends paid, share issues). Reconciles to
movement in cash and cash equivalents (incl. overdraft).

### A6.5 Comparatives (both mechanisms)

- If the org has a prior period in the system → comparatives come from that
  period's final figures automatically (`comparativeSource: 'prior_period'`).
- First year on the platform, option A: **import prior-year final TB** in the
  period setup flow. It runs through the same import + mapping wizard (mappings
  learned there count for the current year too) and is stored as a special
  comparative-only period (`type` per normal, flagged, no adjustments needed).
- First year, option B: **manual comparatives** — an edit mode on each statement
  where the comparative column becomes editable per line; values stored in
  `manualComparatives`. A completeness check warns if comparative SoFP doesn't
  balance.
- Monthly periods: comparative column per `monthlyPack.comparativeColumn`
  (prior month, same month last year, or YTD presentation).

### A6.6 Rounding & integrity checks

- Face of all statements: **whole Rands**. Each statement line = rounded sum of
  its targets' exact balances; each total = sum of *rounded* lines, so columns
  always cast. If rounding makes SoFP assets ≠ equity+liabilities by a small
  amount (≤ R2), the difference is absorbed into the largest line of the
  affected side; larger differences are a real error and block finalisation.
- Hard checks (must all pass to mark statements `final`): TB balances; every
  non-zero account mapped; SoFP balances; SoCE closing RE = SoFP RE; cash flow
  reconciles to cash movement; every posted adjustment balanced; tax note
  current tax = SoCI taxation charge (current portion).

### A6.7 Output styles

- **Standard White (default):** pure white page, black text, Georgia 11pt,
  centred headings, right-aligned tabular numbers, single rule above totals,
  double rule under final totals, note column. This is the print/bank style —
  per the product owner: *financials on a white page with black writing*.
- **Premium [optional smarter look for email]:** same layout, adds the accent
  colour for headings/rules, logo in the page header, subtle grey banding on
  note tables. Still print-safe.
- **Minimal:** no rules except totals, extra whitespace.
Style is chosen per generated report; org setting stores the default.

---

## A7. Statement template engine

### A7.1 Templates

Global `templates/{id}` docs (seeded, versioned, read-only to clients) define each
statement as ordered sections → lines. Each line declares the mapping targets that
feed it, formatting (bold/indent/total), a `showIfZero` flag, and optional
`noteTemplateId` linkage (drives the note column + lead sheet titles).

```typescript
interface StatementTemplate {
  id: string;                      // 'ifrs_sme_sofp_v1'
  statementType: 'sofp' | 'soci' | 'soce' | 'cash_flow' | 'detailed_is';
  version: string;                 // '2026.1'
  sections: {
    id: string; title: string; order: number;
    showTotal: boolean; totalLabel?: string;
    lines: {
      id: string; description: string; order: number;
      targetIds: string[];         // sum of these targets' balances
      sign: 1 | -1;                // presentation sign vs storage convention
      isBold: boolean; indentLevel: number; showIfZero: boolean;
      noteTemplateId?: string;
      totalOf?: string[];          // line ids — for subtotal/total lines
    }[];
  }[];
}
```

The engine: fetch TB + posted adjustments → compute final balance per target →
compute each line (`sign × Σ target balances`, rounded per §A6.6) → compute totals
→ fetch comparatives per §A6.5 → run integrity checks → write a `Statement`
snapshot. Pure function over inputs; deterministic; unit-testable with fixture TBs.

**Difference from the transcript:** no free-text `formula` strings evaluated at
runtime. Lines are sums of targets with a sign — simpler, safer, and covers the
v1 templates entirely. Subtotals reference line ids. (Formula strings are an
earmarked extension if a future template needs them.)

### A7.2 SoCE and cash flow

SoCE and cash flow are not simple target sums; they are computed by dedicated
builders (§A6.3 hard check, §A9) that emit the same `Statement` shape so
rendering and PDF are uniform.

---

## A8. Notes engine

### A8.1 Note templates (global, seeded)

Each note template defines: title, applicability rule, ordered blocks (paragraph
templates with `{placeholders}`, table definitions bound to targets/movement
data), and whether it is required.

**Source of truth for note content and AFS look: the product owner supplies the
full set of notes and example AFS** (Part C #1 — committed, not optional). The
note templates are built *from* that supplied set in Phase 6; the list below is
a provisional checklist of what a typical SA IFRS-for-SMEs set contains, used
only to size the work and sanity-check completeness against the supplied notes:

1. Accounting policies (required; sub-policies included based on which targets
   have balances — e.g. inventories policy only if inventory exists)
2. Property, plant and equipment (movement table per asset class: opening cost/
   accum dep, additions, disposals, depreciation, closing — additions/disposals/
   depreciation from adjustment lines and target movements)
3. Intangible assets
4. Loans to/from shareholders and directors
5. Inventories
6. Trade and other receivables
7. Cash and cash equivalents (incl. overdraft disclosure)
8. Share capital (authorised/issued)
9. Interest-bearing borrowings (with maturity split)
10. Provisions
11. Trade and other payables
12. Revenue (disaggregation by target)
13. Other income
14. Operating profit disclosures (auditor's/compiler's fees, depreciation,
    employee costs — required disclosure items)
15. Investment revenue
16. Finance costs
17. **Taxation (the tax note — §A8.5)**
18. Dividends
19. Related parties
20. Events after the reporting period (text-only)
21. Going concern (text-only, conditional)
22. Comparative figures / prior period adjustment (conditional, text)

Do not invent final wording — build from the supplied notes; where a supplied
note doesn't exist for an applicable area, ask the product owner in Phase 6.

### A8.2 Numbering & applicability

- Auto-applicability: rule per template, usually "any bound target has a non-zero
  current or comparative balance". Users can toggle any non-required note on/off;
  the toggle is remembered in org settings for future periods.
- **Note numbers are assigned at pack assembly** in template order over enabled
  notes (Accounting policies is always 1). Statement note-column references
  resolve at the same time, so disabling a note renumbers cleanly.

### A8.3 Editing rules (the product owner's core requirement)

- Paragraph text: always editable, per note instance, persisted.
- Table amounts: computed; individual cell override allowed with a persistent
  "overridden" warning and one-click revert. Overrides do **not** flow back into
  statements — if the statements are wrong, fix the mapping or post an
  adjustment. The note editor says exactly that in the override warning.

### A8.4 Accounting policies note

Assembled from policy fragments toggled by applicable targets + a base fragment
(basis of preparation: IFRS for SMEs, historical cost, functional currency).
Every fragment's text is editable; org-level edits are remembered as the org's
house policies for subsequent periods.

### A8.5 The tax note & tax computation [NEW — per product owner's Q&A]

Backed by `taxComputation/main` (§A3.11). Editor layout:

```
Profit before taxation (from SoCI, read-only)            X
Add back (user-managed rows):
  Depreciation per accounts                              X
  Provisions raised                                      X
  Penalties and fines                                    X
  [+ Add row]
Less (user-managed rows):
  Wear and tear allowances (s11(e))                     (X)
  Profit on disposal (capital)                          (X)
  [+ Add row]
Assessed loss brought forward                           (X)
────────────────────────────────────────────────────────
Taxable income                                           X   (computed)
Normal tax at 27% (rate editable)                        X   (computed)
Deferred tax movement (manual in v1)                     X
────────────────────────────────────────────────────────
Taxation per statement of comprehensive income           X
```

- Common add-back/deduction rows are offered as quick-picks; depreciation
  defaults in from the depreciation adjustments if present, editable.
- The SoCI taxation line and the tax note pull from this computation; the tax
  note also renders the standard rate-reconciliation presentation from the same
  data. Current tax payable/receivable on the SoFP comes from its mapped target
  (opening balance + payments live in the TB); a soft check compares movement
  vs the computed charge and flags large mismatches.
- **v1 does not compute deferred tax automatically.** The manual deferred-tax
  line exists because IFRS for SMEs requires deferred tax recognition; the note
  editor shows a reminder. Automatic deferred tax (temporary-difference
  schedule) is earmarked.

---

## A9. Cash flow engine (indirect) [NEW]

### A9.1 Inputs

Current final balances per target, comparative balances per target (from prior
period / imported prior TB; **if comparatives are manual-only, the cash flow
cannot be derived** — the statement then offers manual entry per line with the
same reconciliation check), the tax computation, and adjustment metadata
(depreciation adjustments, disposal entries).

### A9.2 Method

Each target's `cashFlowClass` (§A3.12) drives classification:

- Start: profit before tax (SoCI).
- Non-cash adjustments: depreciation & amortisation (movement on accum dep/amort
  targets + depreciation adjustment lines), provisions movement, profit/loss on
  disposal targets.
- Working capital: Δ inventories, Δ trade and other receivables, Δ trade and
  other payables (targets classed `operating_wc`).
- **Tax paid** = opening current tax payable/receivable + current tax charge −
  closing balance (classic balancing figure).
- Investing: Δ on cost-side PPE/intangible targets split into additions (from
  PPE note movement data) and disposal proceeds.
- Financing: Δ borrowings targets, Δ shareholder loan targets, share capital
  issues, **dividends paid** (dividends declared per SoCE ± Δ dividends payable).
- Cash and cash equivalents: targets classed `cash` (bank, petty cash, overdraft).

### A9.3 Reconciliation check (hard)

Computed net increase/decrease in cash must equal Δ of `cash`-classed targets.
Any difference is displayed as an "unallocated movement" line in a diagnostics
panel listing targets whose movements weren't picked up — the user resolves by
fixing mappings/classes or overriding a line. Finalisation is blocked while a
difference exists (per §A6.6).

Line-level manual override is available (same warning pattern as note tables);
the reconciliation check still applies after overrides.

---

## A10. Lead sheets & working papers

The working model here is a **simplified Draftworx/CaseWare lead schedule**: each
statement area gets a schedule that drills the FS line down to its GL accounts,
with the evidence (Excel workings, PDFs) filed directly beneath it. No audit
programmes, procedures, or tickmarks.

### A10.1 The lead schedule layout

```
LS-002 (or "B")  Trade and other receivables            v Reconciled
─────────────────────────────────────────────────────────────────────
Account                        TB balance    Adjustments      Final      Prior yr
1100  Debtors control            380,000        (15,000)    365,000      410,000
1150  Prepayments                  5,000              —        5,000        8,000
─────────────────────────────────────────────────────────────────────
                                 385,000        (15,000)    370,000      418,000
Per AFS: Trade and other receivables            370,000   Difference: 0.00

Adjustments applied:
  AJ003  Allowance for doubtful debts           (15,000)   [view]

Working papers:
  WP-001  AR_Aging_Feb2026.xlsx        [inline Excel preview]
    └─ Debtors_Confirmation.pdf        [inline PDF preview, attached below]
  WP-002  Doubtful_Debts_Calc.xlsx
  [+ Add working paper]
```

- **Account rows are the drill-down** (Draftworx's working-trial-balance drill):
  every GL account mapped into this FS line, showing unadjusted TB balance,
  adjustments, final balance, and prior year. Clicking an adjustment opens it.
- The schedule total must tie to the AFS line; difference must be zero →
  "Reconciled" badge. (Because statements derive from TB + adjustments, a
  non-zero difference only arises from note-table overrides or stale
  statements — the card links to the cause.)
- Lead schedules are recomputed on statement regeneration; attached working
  papers persist.
- Each lead schedule is printable on its own and included in an optional
  "working paper file" export (earmarked: v1 prints individually).

### A10.1a Generation

`Auto-Generate All` creates one lead schedule per SoFP note-bearing line with a
non-zero balance (and none for zero lines); users can also create ad-hoc ones.
References assigned in statement order.

### A10.2 Working papers: numbering & placement

- Working papers list **below their lead sheet**, in `order`.
- Reference auto-defaults to the **next logical number within that lead sheet**
  (`WP-001`, `WP-002`, …, per org numbering settings §A3.5); user may override at
  creation; uniqueness enforced per lead sheet.
- **Referencing style is an org setting:** `numeric` (default: `LS-001` /
  `WP-001`) or `section_letter` (CaseWare convention: lead schedules `A`, `B`,
  `C`… in statement order, working papers `B1`, `B2`… under them). Product owner
  to pick a default when reviewing Phase 8 (Appendix 2 #11).

### A10.3 Right-click context menu (on a lead sheet card)

```
Upload Excel file
Upload PDF file
Upload image
──────────────
Print lead sheet
──────────────
Delete lead sheet
```

(The same actions exist as visible buttons for discoverability — right-click is
the power-user path the product owner asked for; "link external file", copy and
email of individual lead sheets are earmarked.)

### A10.4 File viewing

- **Excel:** parsed with SheetJS, rendered read-only inline below the working
  paper title (sheet tabs shown if multiple; download to edit). 
- **PDF:** clicking a working paper opens/collapses an inline pdf.js preview
  below it. **A PDF can also be attached *under* an existing (Excel) working
  paper** (`attachedToWpId`) — click the working paper → "Attach PDF below" —
  satisfying the product owner's "import a pdf to show below by clicking on the
  working paper above it".
- Files live in Storage per §A3.9; 25 MB/file limit; types restricted to
  xlsx/xls/csv/pdf/png/jpg.

---

## A11. Adjustments engine

Covered by §A3.10 + §A5.6. Additional rules:

- Posting recomputes period-level derived data lazily: statements/notes/lead
  sheets show a "stale — regenerate" banner rather than auto-regenerating.
- Reversing a posted adjustment creates a mirror-image adjustment referencing the
  original (`reversesAdjustmentId`); nothing is ever hard-deleted once posted
  (draft adjustments can be deleted).
- Adjustment references `AJ001`… increment per period.
- `Import from Excel` (transcript) is **earmarked** — v1 adjustments are entered
  in-app.

---

## A12. Roll-forward & period close

### A12.1 Close

`Close Period` (Reports tab) requires: statements final (all §A6.6 checks pass)
and at least one generated report. Close sets `status: 'closed'`, `isLocked:
true` — enforced by security rules. Reopening is allowed in v1 (internal use)
via an explicit "Reopen period" with a logged reason; reopening clears `final`
status on statements.

### A12.2 Roll forward

Creates the next period (next month, or next FY) and:
- carries `comparativeSource: 'prior_period'` pointing at the closed period;
- creates draft reversing adjustments for every posted adjustment with
  `willAutoReverse`;
- org-level memory (mappings, note selections, layouts, styling, house policy
  text) applies automatically because it lives at org level;
- for a **new financial year**: the opening TB is whatever the user imports next
  (the client's ledger carries its own opening balances). A soft check compares
  imported opening retained earnings against prior closing retained earnings and
  flags a difference (usually missing prior-year adjustments in the ledger).

---

## A13. PDF generation, reports & email

### A13.1 One HTML, two consumers

The pack is rendered as a single paginated HTML document (print CSS: A4 pages,
running headers "Company name · AFS for the year ended …", page numbers,
`page-break` control per section). The Financial Statements tab shows exactly
this HTML; the `generatePdf` Cloud Function renders the same HTML with Puppeteer
→ PDF → Storage. **What you preview is byte-for-byte what prints.**

### A13.2 Report generation flow

`Generate New Report` → choose pack type (Full AFS / Management accounts /
Custom section picker) → style (§A6.7) → confirm → report doc created
(`status: 'generating'`) → function renders → `ready` (or `failed` with message).
Index page numbers computed during render. Report cards: preview (inline PDF),
download, email, delete.

### A13.3 Email

`Email` on a report card → recipients (defaults from org settings), subject/body
(templated: `{company}`, `{period}`), sends via Resend with the PDF attached
(or a download link if > 8 MB). Sends append to the report's `emailHistory`.

---

## A14. Earmarked for later (do not build, do not block)

**Close Corporations (v2 — first in the queue, per product owner):** CC entity
type alongside companies. Differences to plan for, none of which change the v1
engines: members instead of directors (members' responsibility statement, member
signatures), **member's interest (%)** instead of share capital, loans to/from
members note, **accounting officer's report** (Close Corporations Act) instead
of/alongside the compilation report, "Annual Financial Statements" terminology
per the CC Act, CK registration numbers. The `Organization.entityType` field is
reserved in v1 (§A3.4); templates gain a CC variant set in v2.

Also earmarked: live API integrations (Sage/Xero/QuickBooks) · full IFRS &
FRS 102 templates · multi-user roles, invitations, read-only bank/auditor links ·
Stripe billing & plans · automatic deferred tax · consolidations · XBRL ·
adjustment import from Excel · working-paper-file combined export · magic-link
auth · Microsoft SSO · multi-language.

The data model already reserves: `User.organizations` (role map later),
`Organization.entityType` and `.framework` unions, `subscription` fields (add
when needed), `importSource` enum values.

---

# PART B — PHASED BUILD PLAN

Ten phases. Each lists **Tasks**, **Acceptance criteria** (checkable, not
vibes), and a **Review gate**. A phase is done only when a reviewer agent —
with fresh context, reading this document and the phase's criteria — confirms
every criterion against the actual running code (run it, don't read it).

> **Fixture data (build in Phase 0, use everywhere):** a realistic SA test
> company — "Testco Trading (Pty) Ltd", Feb year-end — with two years of TB
> Excel files (~60 accounts: PPE classes, inventory, debtors, bank, creditors,
> VAT control, loans, share capital, retained earnings, revenue, COS, ~20
> expense accounts), plus known-correct expected outputs (final TB, statement
> totals, tax computation) computed by hand in a spreadsheet committed to the
> repo. Every engine test asserts against these known-correct numbers.

### Phase 0 — Project scaffold & foundations
**Tasks:** New Next.js + TypeScript + Tailwind + shadcn/ui repo (this is a fresh
app — do not build inside the debtors-form app). Firebase project (Auth,
Firestore, Storage, Functions, Hosting) with emulator suite wired for local dev;
CI running typecheck, lint, unit tests against emulators. Seed scripts for
`mappingTargets` (Appendix 1) and statement/note template stubs. Build the
Testco fixture files + expected-results spreadsheet.
**Acceptance:** `npm run dev` serves the app against emulators; seed script
populates targets/templates; CI green; fixtures committed.
**Review gate:** reviewer boots the emulator stack from a clean clone using only
the README.

### Phase 1 — Auth, dashboard, organisation setup
**Tasks:** Email/password + Google sign-in, email verification; dashboard (org
cards, create org); full org setup/settings screens (§A5.3) incl. logo upload,
directors, compiler details, year-end, frequency, pack toggles; settings doc
with defaults; security rules v1 deployed + rules unit tests.
**Acceptance:** create account → create Testco with logo, 2 directors, compiler
details, Feb year-end, yearly frequency; data verified in emulator; a second
account cannot read Testco (rules test).
**Review gate:** rules tests pass; reviewer completes setup flow end-to-end.

### Phase 2 — Periods & TB import
**Tasks:** Period creation (monthly/yearly per org frequency, correct start/end
dates incl. leap Feb); import wizard (§A5.4): sheet picker, column mapping with
per-org memory, validation (balance check blocks, duplicate codes), Storage
upload of original; AG Grid TB view with search/filters/inline edit; Final TB
view (TB only at this point); re-import with change summary.
**Acceptance:** import Testco FY2025 xlsx and FY2026 csv; unbalanced file is
blocked showing the exact difference; duplicate-code file is blocked; totals
match fixture expectations to the cent; original files present in Storage.
**Review gate:** reviewer imports a deliberately broken file set and confirms
every validation fires.

### Phase 3 — Mapping
**Tasks:** Mapping tab (§A5.5): suggestions pipeline (code → exact name → fuzzy),
grouped searchable target picker, auto-map, unusual-balance flags, org mapping
memory writes, `mappingComplete` gating, mapped-accounts management.
**Acceptance:** map Testco FY2026 fully; delete the period, re-import the same
TB → 100% auto-mapped from memory; import FY2027 fixture (3 new accounts) →
only the 3 appear unmapped; fuzzy suggestion appears for a renamed account.
**Review gate:** reviewer verifies the remembered-mapping loop and that FS tab
stays disabled until mapping completes.

### Phase 4 — Adjustments
**Tasks:** Adjustments tab (§A5.6/§A11): CRUD, balance enforcement, posting,
reversal, auto-reverse flag, new-account-with-target creation, supporting doc
upload, impact summary, `AJ` numbering, Final TB view now includes adjustments
with Excel export.
**Acceptance:** post fixture depreciation + accrual + reclass on Testco; impact
summary and Final TB match the expected-results spreadsheet to the cent;
unbalanced adjustment cannot be posted; reversal mirrors correctly.
**Review gate:** reviewer reconciles Final TB export against the fixture
spreadsheet independently.

### Phase 5 — Statement engine: SoFP, SoCI, SoCE, Detailed IS
**⛔ Before starting: request the full note set and example AFS (the desired
look) from the product owner (Part C #1). Layout and wording decisions in this
phase and Phase 6 are built from them, not invented.**
**Tasks:** Template engine (§A7) + seeded IFRS-SME templates for SoFP/SoCI/
detailed IS; SoCE builder; comparatives: prior-period source + prior-year TB
import flow + manual entry mode (§A6.5); rounding + integrity checks (§A6.6);
paper-view rendering (Standard White) with drill-down; stale-data banner.
**Acceptance:** Testco statements match expected totals exactly; SoFP balances;
SoCE RE ties to SoFP; zero-balance lines suppressed; comparatives correct in all
three modes; rounding: columns cast in whole Rands; visual layout approved by
the product owner against the example PDFs.
**Review gate:** reviewer recomputes every statement total from the Final TB
export; product owner sign-off on layout (real boundary — wait for it).

### Phase 6 — Notes engine & tax computation
**Tasks:** Note templates for the v1 set (§A8.1) with wording drafted against
the example PDFs; applicability rules; numbering at assembly; selection UI with
persistence; paragraph editing; computed tables (incl. PPE movement from
adjustments) with cell override + warning + revert; accounting policies
assembly; **tax computation editor + tax note (§A8.5)** with quick-pick
add-backs, editable rate, manual deferred tax line, SoCI linkage, soft SoFP
movement check.
**Acceptance:** Testco fixture tax computation reproduces the expected current
tax to the Rand and flows to SoCI; PPE note movement ties to depreciation
adjustment + additions; disabling a note renumbers references; an overridden
cell shows the warning and reverts cleanly; note text edits survive reload.
**Review gate:** product owner reviews note wording + tax note against the
example PDFs (real boundary — wait for it).

### Phase 7 — Cash flow
**Tasks:** Cash flow engine (§A9), diagnostics panel for unallocated movements,
manual override with persistent warning, manual-comparatives fallback entry,
finalisation blocking on reconciliation failure.
**Acceptance:** Testco cash flow reconciles to actual cash movement with zero
unallocated difference; deliberately mis-classing a target surfaces it in
diagnostics; tax paid matches the balancing-figure calculation in the fixture
spreadsheet.
**Review gate:** reviewer traces every cash flow line back to target movements.

### Phase 8 — Lead sheets & working papers
**Tasks:** §A10 in full: auto-generate lead schedules from SoFP lines **with
the account-level breakdown (drill-down) body and prior-year column**,
reconciliation, right-click context menu, Excel/PDF/image upload with
per-lead-sheet `WP-` auto-numbering, both referencing styles (numeric /
section-letter), SheetJS inline Excel viewer, pdf.js inline viewer,
attach-PDF-below-working-paper, per-schedule print, Storage rules for working
paper paths.
**Acceptance:** auto-generate produces one lead schedule per non-zero SoFP note
line, each listing its GL accounts with TB/adjustments/final/prior-year columns
that tie to the Final TB export and to the AFS line, all showing Reconciled;
switching referencing style re-letters schedules correctly; upload xlsx →
renders inline with sheet tabs; upload PDF under it → previews below it on
click; numbering runs WP-001, WP-002… and honours a manual override; 30 MB file
rejected.
**Review gate:** reviewer exercises the full right-click flow including
deletion and re-numbering.

### Phase 9 — Pack assembly, PDF, reports & email
**Tasks:** Front-matter pages (§A6.1 items 1–6) as editable templates; pack
assembler with section toggles, index with computed page numbers, print CSS;
`generatePdf` function (Puppeteer); Premium + Minimal styles; Reports tab
(§A13.2); Resend email with attachment + history; monthly management-accounts
pack honouring `monthlyPack` config.
**Acceptance:** full Testco AFS PDF matches §A6.1 page order with correct index
page numbers; preview HTML and PDF are visually identical; email arrives with
the PDF attached and is logged; a monthly period produces the configured
monthly pack; all three styles render correctly.
**Review gate:** product owner reviews the complete PDF against the example
AFS (real boundary); reviewer diffs preview vs PDF.

### Phase 10 — Roll-forward, close & hardening
**Tasks:** Close/reopen with rules-enforced locking (§A12.1); roll-forward
(§A12.2) incl. auto-reversals and opening-RE soft check; end-to-end happy-path
test (import → PDF → close → roll forward → second period < 30 min); empty/
error/loading states across all tabs; Firestore index review; basic usage
logging.
**Acceptance:** the v1 success criteria in §A1.4 all pass, demonstrated on
Testco two-year fixtures; a locked period rejects writes at the rules layer
(tested, not assumed).
**Review gate:** full simulated year-end run by the reviewer, then product
owner acceptance.

---

# PART C — INPUTS NEEDED FROM THE PRODUCT OWNER (ask, don't invent)

| # | Input | Needed before | Why |
|---|---|---|---|
| 1 | **The full set of notes + example AFS showing the desired look** (the product owner has committed to supplying all notes and the AFS look) | Phase 5 starts | Statement layout, note wording and front-matter wording are built *from* these — never invented. Interim layout reference only: [Draftworx example financials](https://draftworx.com/download/Draftworx-Example-Financials.pdf) |
| 2 | Bennetts firm details for the compiler block (firm name, practitioner, designation, practice number) | Phase 1 (can use placeholders until Phase 9) | Compilation report + general information page |
| 3 | 1–2 real (anonymised) TB exports from the systems clients actually use (Sage Pastel etc.) | Phase 2 | Import wizard must handle the real file shapes, not idealised fixtures |
| 4 | House wording preferences for directors' report / responsibility statement, if any | Phase 9 | Editable templates should start from preferred wording |
| 5 | Decision: app name/domain/branding | Phase 9 | Cover pages, email sender, hosting domain |
| 6 | Repo/hosting decision for the new app (this spec lives in `bennetts_debtors_form`, but the app is a fresh codebase — new repo name?) | Phase 0 | Phase 0 scaffolds a new repository |

---

## Appendix 1 — v1 mapping target chart (seed data)

Grouped; `id` in parentheses. Every target carries the metadata fields of §A3.12
(statement line, note table binding, cash-flow class, normal side, detailed-IS
section) — the seed script encodes those; this table is the human-readable list.
**Review this list against the example AFS PDFs in Phase 5 and extend as needed
— it is a starting chart, not a straitjacket.**

**Property, plant and equipment** (per class × cost / accumulated depreciation):
Land and buildings (`ppe_land_cost`, `ppe_land_accdep`) · Plant and machinery
(`ppe_plant_cost`, `ppe_plant_accdep`) · Motor vehicles (`ppe_vehicles_cost`,
`ppe_vehicles_accdep`) · Furniture and fittings (`ppe_furniture_cost`,
`ppe_furniture_accdep`) · Office and computer equipment (`ppe_office_cost`,
`ppe_office_accdep`)

**Intangible assets:** Computer software — cost / accum amort
(`int_software_cost`, `int_software_accamort`) · Goodwill (`int_goodwill`)

**Other non-current assets:** Loans receivable — non-current (`loan_receivable_nc`)
· Deferred tax asset (`deferred_tax_asset`)

**Current assets:** Inventories (`inventory`) · Trade receivables
(`trade_receivables`) · Allowance for doubtful debts (`doubtful_debts_allowance`)
· Prepayments (`prepayments`) · Other receivables (`other_receivables`) · VAT
receivable (`vat_receivable`) · Current tax receivable (`current_tax_receivable`)
· Bank accounts (`bank`) · Petty cash (`petty_cash`)

**Equity:** Share capital (`share_capital`) · Share premium (`share_premium`) ·
Retained earnings — opening (`retained_earnings`) · Dividends declared
(`dividends_declared`)

**Non-current liabilities:** Interest-bearing borrowings — non-current
(`borrowings_nc`) · Instalment sale/finance lease liabilities — non-current
(`finance_lease_nc`) · Shareholder/director loans (`shareholder_loans`) ·
Deferred tax liability (`deferred_tax_liability`)

**Current liabilities:** Trade payables (`trade_payables`) · Accruals
(`accruals`) · Other payables (`other_payables`) · VAT payable (`vat_payable`)
· Current tax payable (`current_tax_payable`) · Payroll liabilities
(`payroll_liabilities`) · Borrowings — current portion (`borrowings_current`) ·
Finance lease — current portion (`finance_lease_current`) · Bank overdraft
(`bank_overdraft`) · Provisions (`provisions`) · Dividends payable
(`dividends_payable`)

**Income:** Revenue — sale of goods (`revenue_goods`) · Revenue — services
(`revenue_services`) · Other income (`other_income`) · Profit/loss on disposal
of assets (`disposal_profit_loss`) · Interest received (`interest_received`) ·
Dividends received (`dividends_received`)

**Cost of sales:** Cost of sales (`cost_of_sales`) · Opening/closing stock
movements map to `cost_of_sales` (detail preserved on the detailed IS via
account-level display)

**Expenses (each its own target; alphabetical on the detailed IS):**
Accounting fees (`exp_accounting`) · Advertising (`exp_advertising`) · Bad debts
(`exp_bad_debts`) · Bank charges (`exp_bank_charges`) · Cleaning
(`exp_cleaning`) · Commission paid (`exp_commission`) · Computer expenses
(`exp_computer`) · Consulting fees (`exp_consulting`) · Depreciation
(`exp_depreciation`) · Amortisation (`exp_amortisation`) · Donations
(`exp_donations`) · Electricity and water (`exp_utilities`) · Employee costs —
salaries and wages (`exp_salaries`) · Entertainment (`exp_entertainment`) ·
Fines and penalties (`exp_fines`) · Insurance (`exp_insurance`) · Lease/rent
paid (`exp_rent`) · Legal fees (`exp_legal`) · Motor vehicle expenses
(`exp_motor`) · Printing and stationery (`exp_printing`) · Repairs and
maintenance (`exp_repairs`) · Security (`exp_security`) · Staff welfare
(`exp_staff_welfare`) · Subscriptions (`exp_subscriptions`) · Telephone and
internet (`exp_telephone`) · Travel — local (`exp_travel_local`) · Travel —
overseas (`exp_travel_overseas`) · General/sundry expenses (`exp_sundry`)

**Finance costs:** Interest paid — borrowings (`fin_interest_borrowings`) ·
Interest paid — SARS (`fin_interest_sars`) · Interest paid — other
(`fin_interest_other`)

**Taxation:** Current tax expense (`tax_current`) · Deferred tax expense
(`tax_deferred`)

---

## Appendix 2 — Assumptions log

Decisions taken in this document that were **not** explicitly specified by the
product owner, flagged for review rather than silently assumed:

1. **Storage sign convention** (debit +, credit −) and single-`balance` engine
   input — implementation detail, no user-visible effect.
2. **SoCI by nature** (not by function) for v1 — the common SA SME presentation;
   confirm against example PDFs in Phase 5.
3. **Whole-Rand face presentation** with ≤ R2 rounding absorption — standard
   practice; confirm in Phase 5.
4. **27% default tax rate** (editable) — current SA corporate rate.
5. **No runtime formula strings** in templates (sums of targets + subtotal
   references instead) — deviation from the transcript for safety/simplicity.
6. **Statements regenerate on demand** (stale banner) rather than live on every
   keystroke — performance/cost decision.
7. **Reopen-period allowed in v1** with logged reason — internal-use pragmatism;
   revisit before external users.
8. **Tab order** places Notes before Lead Sheets (matches the transcript's user
   flow, which reviews notes before evidence); the transcript's tab list had
   Lead Sheets before Notes — product owner can flip this in Phase 5 at zero
   cost (it's a nav array).
9. **The app is a new repository**, not an extension of `bennetts_debtors_form`
   — that repo is a debtors take-on form; AFS Online is a distinct product
   (Part C #6 asks for the repo decision).
10. **Monthly pack default** = SoFP + SoCI with prior-month comparative;
    configurable per §A3.5.
11. **Lead schedule referencing defaults to numeric** (`LS-001`); the CaseWare
    section-letter style (`A`, `B1`…) is available as an org setting — product
    owner to pick the default at Phase 8 review.

---

*End of document.*
