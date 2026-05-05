import React, { useState } from "react";

/**
 * NavItem
 * Props:
 *  - emoji: string
 *  - label: string
 *  - isActive: bool
 *  - onClick: fn
 */
export default function NavItem({ emoji, label, isActive, onClick }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "6px 4px",
        borderRadius: 16,
        transition: "all 0.15s",
        transform: pressed ? "scale(0.9)" : "scale(1)",
        userSelect: "none",
      }}
    >
      {/* Indicador activo */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isActive && (
          <div
            style={{
              position: "absolute",
              inset: -8,
              background: "#EFF6FF",
              borderRadius: 14,
              zIndex: 0,
            }}
          />
        )}
        <span
          style={{
            fontSize: isActive ? 28 : 24,
            lineHeight: 1,
            position: "relative",
            zIndex: 1,
            transition: "font-size 0.2s cubic-bezier(.34,1.56,.64,1)",
            filter: isActive
              ? "drop-shadow(0 2px 6px rgba(77,150,255,0.35))"
              : "none",
          }}
        >
          {emoji}
        </span>
      </div>

      <span
        style={{
          fontFamily: "'Nunito', 'Fredoka One', sans-serif",
          fontWeight: isActive ? 800 : 600,
          fontSize: 11,
          color: isActive ? "#4D96FF" : "#94a3b8",
          transition: "color 0.15s",
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </span>
    </button>
  );
}