"use client";

import { useEffect, useRef, useState } from "react";
import { UploadedFileMeta } from "@/lib/types";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";

interface FileDropzoneProps {
  label: string;
  value: UploadedFileMeta | null;
  onChange: (meta: UploadedFileMeta | null) => void;
  error?: string;
  required?: boolean;
  id: string;
}

const TYPE_BADGES: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
};

function toMeta(file: File): UploadedFileMeta {
  return { name: file.name, size: file.size, type: file.type, file };
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function FileDropzone({ label, value, onChange, error, required, id }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const acceptFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setLocalError("File must be 10MB or smaller");
      return;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setLocalError("File must be a PDF, JPG or PNG");
      return;
    }
    setLocalError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    onChange(toMeta(file));
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setLocalError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayError = localError ?? error;

  return (
    <div>
      <span className="font-body text-xs tracking-wide text-muted">
        {label}
        {required && <span style={{ color: "#E3B679" }}> *</span>}
        {!required && (
          <span
            className="ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] align-middle"
            style={{ background: "rgba(255,255,255,0.06)", color: "#A8A29E" }}
          >
            Optional
          </span>
        )}
      </span>
      {value ? (
        <div
          className="relative overflow-hidden mt-2 rounded-2xl py-4 pr-4 pl-5 flex items-center gap-3.5"
          style={{
            background: "linear-gradient(150deg, rgba(201,134,63,0.08), rgba(255,255,255,0.03))",
            border: "1px solid rgba(201,134,63,0.3)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(180deg,#C9863F,#E3B679)" }} />
          <div className="relative shrink-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt=""
                className="w-12 h-12 rounded-[10px] object-cover block"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-[10px] flex items-center justify-center"
                style={{ background: "linear-gradient(150deg,#C9863F33,#E3B67922)", border: "1px solid #C9863F44" }}
              >
                <span className="font-body text-[11px] font-semibold tracking-wide" style={{ color: "#E3B679" }}>
                  {TYPE_BADGES[value.type] ?? "FILE"}
                </span>
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#C9863F,#E3B679)", border: "2px solid #1C1B19" }}
            >
              <svg viewBox="0 0 16 16" className="w-2.5 h-2.5" fill="none" aria-hidden="true">
                <path d="M3 8l3.5 3.5L13 5" stroke="#141413" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm text-ink truncate">{value.name}</p>
            <p className="font-body text-xs mt-0.5 text-muted">{formatSize(value.size)} · Uploaded</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <label
              htmlFor={id}
              className="focus-copper font-body text-xs font-medium rounded-full px-2.5 py-1.5 cursor-pointer"
              style={{ color: "#E3B679", background: "rgba(201,134,63,0.12)", border: "1px solid rgba(201,134,63,0.3)" }}
            >
              Replace
              <input
                ref={inputRef}
                id={id}
                type="file"
                accept={ALLOWED_FILE_TYPES.join(",")}
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) acceptFile(file);
                }}
              />
            </label>
            <button
              type="button"
              onClick={clearFile}
              className="focus-copper shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-muted hover:text-ink transition-colors"
              aria-label={`Remove ${label}`}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) acceptFile(file);
          }}
          className="focus-copper relative mt-2 rounded-2xl py-7 px-5 flex flex-col items-center cursor-pointer transition-all duration-200"
          style={{
            background: dragActive ? "rgba(201,134,63,0.08)" : "rgba(255,255,255,0.03)",
            border: `1.5px dashed ${dragActive ? "#C9863F" : displayError ? "#f87171" : "rgba(201,134,63,0.35)"}`,
            transform: dragActive ? "scale(1.01)" : undefined,
            boxShadow: dragActive ? "0 0 0 4px rgba(201,134,63,0.12)" : undefined,
          }}
        >
          <div
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#C9863F,#E3B679)",
              boxShadow: dragActive ? "0 0 0 6px rgba(201,134,63,0.1), 0 0 24px 2px rgba(201,134,63,0.5)" : "0 0 0 6px rgba(201,134,63,0.1)",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
              <path d="M12 16V5M12 5L7 10M12 5l5 5" stroke="#141413" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 16.5V18a2 2 0 002 2h10a2 2 0 002-2v-1.5" stroke="#141413" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-body text-sm font-medium mt-3.5 mb-0.5 text-center text-ink">
            {dragActive ? "Drop it here" : "Drag & drop your file here"}
          </p>
          <p className="font-body text-xs mb-3 text-center text-muted">or click to browse · max 10MB</p>
          <div className="flex gap-1.5">
            {["PDF", "JPG", "PNG"].map((ext) => (
              <span
                key={ext}
                className="font-body text-[10px] font-semibold tracking-wide rounded-full px-2.5 py-0.5"
                style={{ background: "rgba(255,255,255,0.06)", color: "#A8A29E" }}
              >
                {ext}
              </span>
            ))}
          </div>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={ALLOWED_FILE_TYPES.join(",")}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) acceptFile(file);
            }}
          />
        </label>
      )}
      {displayError && <span className="mt-1.5 block text-xs text-red-400">{displayError}</span>}
    </div>
  );
}
