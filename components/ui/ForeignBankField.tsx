"use client";

import { useEffect, useRef, useState } from "react";
import { MAJOR_INTL_BANKS } from "@/lib/constants";

interface ForeignBankFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Called with the bank's SWIFT/BIC code when a listed bank is picked. */
  onSelectBank?: (swiftCode: string) => void;
  error?: string;
  required?: boolean;
  id?: string;
  placeholder?: string;
}

export function ForeignBankField({ label, value, onChange, onSelectBank, error, required, id, placeholder }: ForeignBankFieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const query = value.trim().toLowerCase();
  const matches = query.length === 0 ? [] : MAJOR_INTL_BANKS.filter((b) => b.name.toLowerCase().includes(query));

  const inputId = id;

  return (
    <div className="relative" ref={containerRef}>
      <label className="block" htmlFor={inputId}>
        <span className="font-body text-xs tracking-wide text-muted">
          {label}
          {required && <span style={{ color: "#E3B679" }}> *</span>}
        </span>
        <span className="relative mt-2 block">
          <input
            id={inputId}
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="focus-copper w-full font-body text-sm rounded-xl pl-4 pr-10 py-3 outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: error ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.08)",
              color: "#FAFAF8",
            }}
          />
          <svg
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            viewBox="0 0 12 8"
            fill="none"
            aria-hidden="true"
          >
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </label>
      {error && (
        <span id={`${inputId}-error`} className="mt-1.5 block text-xs text-red-400">
          {error}
        </span>
      )}
      {open && matches.length > 0 && (
        <ul
          className="absolute z-20 mt-1 w-full rounded-xl overflow-hidden max-h-56 overflow-y-auto"
          style={{ background: "#1C1B19", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.7)" }}
        >
          {matches.map((bank) => (
            <li key={bank.name}>
              <button
                type="button"
                onClick={() => {
                  onChange(bank.name);
                  onSelectBank?.(bank.swift);
                  setOpen(false);
                }}
                className="focus-copper w-full text-left px-4 py-2.5 font-body text-sm transition-colors duration-150 hover:brightness-125 flex items-center justify-between gap-3"
                style={{ color: "#FAFAF8" }}
              >
                <span>{bank.name}</span>
                <span className="font-body text-xs text-muted">{bank.swift}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
