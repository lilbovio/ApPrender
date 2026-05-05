import React, { useEffect, useRef, useState } from "react";

/**
 * ProgressBar
 * Props:
 *  - value: number  (0 a 100)
 *  - color: string  (hex)
 *  - height: number (px, default 18)
 *  - showLabel: bool
 *  - label: string  (custom, si no muestra el %)
 *  - animated: bool (default true — la barra crece con animación)
 *  - striped: bool
 *  - emoji: string  (se mueve al final de la barra)
 */
export default function ProgressBar({
  value = 0,
  color = "#4D96FF",
  height = 18,
  showLabel = true,
  label,
  animated = true,
  striped = false,
  emoji,
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const [displayed, setDisplayed] = useState(animated ? 0 : clamped);
  const raf = useRef(null);

  useEffect(() => {
    if (!animated) { setDisplayed(clamped); return; }
    let start = null;
    const from = displayed;
    const to = clamped;
    const duration = 700;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (to - from) * ease);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped]);

  const borderRadius = height / 2 + 4;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      {showLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#475569",
          }}
        >
          <span>{label || `${Math.round(displayed)}%`}</span>
          {emoji && <span>{emoji}</span>}
        </div>
      )}

      <div
        style={{
          width: "100%",
          height,
          background: "#e8eef6",
          borderRadius,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${displayed}%`,
            height: "100%",
            background: color,
            borderRadius,
            position: "relative",
            transition: animated ? "none" : "width 0.7s cubic-bezier(.4,2,.6,1)",
            backgroundImage: striped
              ? `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 8px,
                  rgba(255,255,255,0.25) 8px,
                  rgba(255,255,255,0.25) 16px
                )`
              : undefined,
            overflow: "hidden",
          }}
        >
          {/* Brillo */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "rgba(255,255,255,0.28)",
              borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
            }}
          />
        </div>

        {/* Emoji viajero */}
        {emoji && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${displayed}%`,
              transform: "translate(-50%, -50%)",
              fontSize: height * 1.4,
              lineHeight: 1,
              transition: "left 0.7s cubic-bezier(.4,2,.6,1)",
              pointerEvents: "none",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.18))",
            }}
          >
            {emoji}
          </div>
        )}
      </div>
    </div>
  );
}