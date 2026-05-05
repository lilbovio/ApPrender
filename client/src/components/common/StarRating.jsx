import React, { useState } from "react";

/**
 * StarRating
 * Props:
 *  - value: number (0-5)
 *  - onChange: fn (valor nuevo) — si no se pasa, es solo lectura
 *  - max: number (default 5)
 *  - size: number (px del emoji/estrella)
 *  - readOnly: bool
 *  - showValue: bool
 */
export default function StarRating({
  value = 0,
  onChange,
  max = 5,
  size = 32,
  readOnly = false,
  showValue = false,
}) {
  const [hovered, setHovered] = useState(null);
  const readOnlyMode = readOnly || !onChange;

  const displayed = hovered !== null ? hovered : value;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        userSelect: "none",
      }}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < displayed;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnlyMode}
            onClick={() => !readOnlyMode && onChange?.(i + 1)}
            onMouseEnter={() => !readOnlyMode && setHovered(i + 1)}
            onMouseLeave={() => !readOnlyMode && setHovered(null)}
            style={{
              background: "none",
              border: "none",
              padding: 2,
              cursor: readOnlyMode ? "default" : "pointer",
              fontSize: size,
              lineHeight: 1,
              transition: "transform 0.14s",
              transform: !readOnlyMode && hovered === i + 1 ? "scale(1.25) rotate(-8deg)" : "scale(1)",
              filter: filled
                ? "drop-shadow(0 2px 4px rgba(255,200,0,0.4))"
                : "grayscale(1) opacity(0.35)",
              display: "inline-flex",
            }}
            aria-label={`${i + 1} estrella${i !== 0 ? "s" : ""}`}
          >
            ⭐
          </button>
        );
      })}

      {showValue && (
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: size * 0.55,
            color: "#475569",
            marginLeft: 4,
          }}
        >
          {value}/{max}
        </span>
      )}
    </div>
  );
}