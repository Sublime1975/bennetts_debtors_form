"use client";

import { useRef, useState } from "react";
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
    onChange(toMeta(file));
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
          className="mt-2 rounded-xl p-4 flex items-center gap-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(201,134,63,0.35)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#C9863F22", color: "#E3B679" }}
            aria-hidden="true"
          >
            📄
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm text-ink truncate">{value.name}</p>
            <p className="font-body text-xs mt-0.5 text-muted">{formatSize(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setLocalError(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="focus-copper shrink-0 text-muted hover:text-ink transition-colors rounded"
            aria-label={`Remove ${label}`}
          >
            ✕
          </button>
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
          className="focus-copper mt-2 rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:brightness-125"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1.5px dashed ${dragActive ? "#C9863F" : displayError ? "#f87171" : "rgba(184,134,11,0.35)"}`,
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#C9863F22", color: "#E3B679" }}
            aria-hidden="true"
          >
            ⬆
          </div>
          <div>
            <p className="font-body text-sm text-ink">Click or drag file to upload</p>
            <p className="font-body text-xs mt-0.5 text-muted">PDF, JPG or PNG — max 10MB</p>
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
