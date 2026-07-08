"use client";

import { useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  error?: string;
  required?: boolean;
  width?: number;
  height?: number;
}

export function SignaturePad({ label, value, onChange, error, required, width = 640, height = 140 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(!!value);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#FAFAF8";
    ctxRef.current = ctx;
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = value;
    }
    // Restore the drawing once on mount only — subsequent value changes come from
    // this component's own onChange, so re-running here would just redraw a stale image.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !ctxRef.current || !lastPointRef.current) return;
    e.preventDefault();
    const point = getPoint(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctxRef.current.lineTo(point.x, point.y);
    ctxRef.current.stroke();
    lastPointRef.current = point;
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
      setHasDrawn(true);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (ctxRef.current && canvas) ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
    setHasDrawn(false);
  };

  return (
    <div>
      <span className="font-body text-xs tracking-wide text-muted">
        {label}
        {required && <span style={{ color: "#E3B679" }}> *</span>}
      </span>
      <div
        className="relative mt-2 rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: `1.5px dashed ${error ? "#f87171" : "rgba(201,134,63,0.35)"}`,
        }}
      >
        {!hasDrawn && (
          <span
            className="absolute top-2.5 left-3.5 font-display italic text-xs pointer-events-none"
            style={{ color: "#6b6862" }}
          >
            Sign here
          </span>
        )}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ display: "block", width: "100%", height, touchAction: "none", cursor: "crosshair", borderRadius: 14 }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="font-body text-[11px] text-muted">Draw with your mouse, finger or stylus</span>
        <button type="button" onClick={clear} className="focus-copper font-body text-xs font-medium rounded" style={{ color: "#E3B679" }}>
          Clear
        </button>
      </div>
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </div>
  );
}
