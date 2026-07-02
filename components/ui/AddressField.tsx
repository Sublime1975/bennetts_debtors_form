"use client";

import { useEffect, useRef, useState } from "react";

interface AddressFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  id?: string;
  placeholder?: string;
}

interface Suggestion {
  place_id: number;
  display_name: string;
}

export function AddressField({ label, value, onChange, error, required, id, placeholder }: AddressFieldProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 4) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({
        format: "json",
        addressdetails: "0",
        countrycodes: "za",
        limit: "5",
        q: value,
      });
      fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: Suggestion[]) => {
          setSuggestions(Array.isArray(data) ? data : []);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputId = id;

  return (
    <div className="relative" ref={containerRef}>
      <label className="block" htmlFor={inputId}>
        <span className="font-body text-xs tracking-wide text-muted">
          {label}
          {required && <span style={{ color: "#E3B679" }}> *</span>}
        </span>
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
          className="focus-copper mt-2 w-full font-body text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: error ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.08)",
            color: "#FAFAF8",
          }}
        />
      </label>
      {error && (
        <span id={`${inputId}-error`} className="mt-1.5 block text-xs text-red-400">
          {error}
        </span>
      )}
      {open && (loading || suggestions.length > 0) && (
        <ul
          className="absolute z-20 mt-1 w-full rounded-xl overflow-hidden max-h-56 overflow-y-auto"
          style={{ background: "#1C1B19", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.7)" }}
        >
          {loading && suggestions.length === 0 && (
            <li className="px-4 py-2.5 font-body text-xs text-muted">Searching…</li>
          )}
          {suggestions.map((s) => (
            <li key={s.place_id}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.display_name);
                  setSuggestions([]);
                  setOpen(false);
                }}
                className="focus-copper w-full text-left px-4 py-2.5 font-body text-sm transition-colors duration-150 hover:brightness-125"
                style={{ color: "#FAFAF8" }}
              >
                {s.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
