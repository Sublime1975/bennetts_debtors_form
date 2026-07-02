"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { AppFormData, Director, FieldErrors, StepId } from "./types";
import { STEP_ORDER } from "./constants";

const blankDirector = (): Director => ({
  fullName: "",
  idNumber: "",
  residentialAddress: "",
  idDocument: null,
});

const initialFormData: AppFormData = {
  company: {
    tradingName: "",
    registeredName: "",
    entityType: "",
    isForeignEntity: null,
    cipcNumber: "",
    countryOfRegistration: "",
    foreignRegistrationNumber: "",
  },
  contact: {
    contactPerson: "",
    email: "",
    phone: "",
    physicalAddress: "",
    postalAddress: "",
    postalSameAsPhysical: false,
    accountsContactDifferent: false,
    accountsContactName: "",
    accountsEmail: "",
    accountsPhone: "",
  },
  directors: [blankDirector()],
  references: {
    tradeRef1: { companyName: "", contactPerson: "", phone: "", email: "" },
    tradeRef2: { companyName: "", contactPerson: "", phone: "", email: "" },
  },
  tax: {
    vatRegistered: null,
    vatNumber: "",
    incomeTaxNumber: "",
    bbeeLevel: "",
  },
  banking: {
    isForeignBank: null,
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    branchCode: "",
    accountType: "",
    swiftCode: "",
    bankCountry: "",
    accountCurrency: "",
    bankAddress: "",
  },
  documents: {
    cipcCertificate: null,
    vatCertificate: null,
    sarsNoticeOfRegistration: null,
    proofOfAddress: null,
    bankConfirmationLetter: null,
    suretyshipDoc: null,
  },
  credit: {
    creditLimitRequested: "",
    estimatedMonthlyPurchase: "",
    paymentTermsRequested: "",
    suretyshipAgreement: false,
  },
  declaration: {
    signatureFullName: "",
    signatureDate: "",
  },
  consent: {
    accurateInfo: false,
    popiConsent: false,
  },
};

type SectionKey = Exclude<keyof AppFormData, "directors">;

interface FormContextValue {
  formData: AppFormData;
  currentStep: StepId;
  errors: FieldErrors;
  referenceNumber: string | null;
  updateSection: <K extends SectionKey>(section: K, patch: Partial<AppFormData[K]>) => void;
  addDirector: () => void;
  removeDirector: (index: number) => void;
  updateDirector: (index: number, patch: Partial<Director>) => void;
  setErrors: (errors: FieldErrors) => void;
  goNext: (nextStep?: StepId) => void;
  goBack: () => void;
  goToStep: (step: StepId) => void;
  resetForm: () => void;
  setReferenceNumber: (value: string) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<AppFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState<StepId>("welcome");
  const [errors, setErrorsState] = useState<FieldErrors>({});
  const [referenceNumber, setReferenceNumberState] = useState<string | null>(null);

  const updateSection = useCallback(<K extends SectionKey>(section: K, patch: Partial<AppFormData[K]>) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...patch },
    }));
  }, []);

  const addDirector = useCallback(() => {
    setFormData((prev) => ({ ...prev, directors: [...prev.directors, blankDirector()] }));
  }, []);

  const removeDirector = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== index),
    }));
  }, []);

  const updateDirector = useCallback((index: number, patch: Partial<Director>) => {
    setFormData((prev) => ({
      ...prev,
      directors: prev.directors.map((director, i) => (i === index ? { ...director, ...patch } : director)),
    }));
  }, []);

  const setErrors = useCallback((next: FieldErrors) => {
    setErrorsState(next);
  }, []);

  const goToStep = useCallback((step: StepId) => {
    setErrorsState({});
    setCurrentStep(step);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goNext = useCallback(
    (nextStep?: StepId) => {
      const index = STEP_ORDER.indexOf(currentStep);
      const target = nextStep ?? STEP_ORDER[Math.min(index + 1, STEP_ORDER.length - 1)];
      goToStep(target);
    },
    [currentStep, goToStep]
  );

  const goBack = useCallback(() => {
    const index = STEP_ORDER.indexOf(currentStep);
    const target = STEP_ORDER[Math.max(index - 1, 0)];
    goToStep(target);
  }, [currentStep, goToStep]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrorsState({});
    setReferenceNumberState(null);
    goToStep("welcome");
  }, [goToStep]);

  const setReferenceNumber = useCallback((value: string) => {
    setReferenceNumberState(value);
  }, []);

  const value = useMemo<FormContextValue>(
    () => ({
      formData,
      currentStep,
      errors,
      referenceNumber,
      updateSection,
      addDirector,
      removeDirector,
      updateDirector,
      setErrors,
      goNext,
      goBack,
      goToStep,
      resetForm,
      setReferenceNumber,
    }),
    [
      formData,
      currentStep,
      errors,
      referenceNumber,
      updateSection,
      addDirector,
      removeDirector,
      updateDirector,
      setErrors,
      goNext,
      goBack,
      goToStep,
      resetForm,
      setReferenceNumber,
    ]
  );

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormState() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormState must be used within a FormProvider");
  return ctx;
}
