import React, { useState } from "react";

/**
 * VAKCard
 * Tarjeta seleccionable para el test de tipo de aprendizaje VAK.
 * Props:
 *  - type: "visual" | "auditory" | "kinesthetic"
 *  - selected: bool
 *  - onClick: fn
 *  - disabled: bool
 */

const VAK_DATA = {
  visual: {
    emoji: "👀",
    title: "Visual",
    description: "Aprendes mejor viendo imágenes, colores y diagramas.",
    color: "#4D96FF",
    bg: "#EFF6FF",
    border: "#bfdbfe",
    examples: ["📊 Gráficas", "🎨 Colores", "🖼️ Imágenes"],
  },
  auditory: {
    emoji: "👂",
    title: "Auditivo",
    description: "Aprendes mejor escuchando explicaciones y sonidos.",
    color: "#CC5DE8",
    bg: "#F8F0FF",
    border: "#e9d5ff",
    examples: ["🎵 Canciones", "🔊 Escuchar", "💬 Hablar"],
  },
  kinesthetic: {
    emoji: "🙌",
    title: "Kinestésico",
    description: "Aprendes mejor haciendo actividades y moviéndote.",
    color: "#FF6B6B",
    bg: "#FFF5F5",
    border: "#fecaca",
    examples: ["✍️ Escribir", "🎮 Jugar", "🤸 Moverse"],
  },
};

export default function VAKCard({ type, selected = false, onClick, disabled = false }) {
  const [hovered, setHovered] = useState(false);
  const data = VAK_DATA[type];
  if (!data) return null;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      style={{
        background: selected ? data.bg : "#fff",
        border: `3px solid ${selected ? data.color : hovered ? data.border : "#e2e8f0"}`,
        borderRadius: 24,
        padding: "22px 18px",
        cursor: disabled ? "default" : "pointer",
        textAlign: "left",
        width: "100%",
        transition: "all 0.2s cubic-bezier(.4,2,.6,1)",
        transform: selected
          ? "scale(1.02)"
          : hovered
          ? "translateY(-3px)"
          : "translateY(0)",
        boxShadow: selected
          ? `0 8px 24px ${data.color}30`
          : hovered
          ? "0 6px 20px rgba(0,0,0,0.1)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Nunito', 'Fredoka One', sans-serif",
      }}
    >
      {/* Fondo decorativo */}
      <div
        style={{
          position: "absolute",
          top: -16,
          right: -16,
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: data.bg,
          opacity: selected ? 1 : 0.5,
          transition: "opacity 0.2s",
        }}
      />

      {/* Check mark */}
      {selected && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: data.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            color: "#fff",
            animation: "popIn 0.25s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          ✓
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Emoji */}
        <div
          style={{
            fontSize: 44,
            lineHeight: 1,
            marginBottom: 10,
            display: "inline-block",
            animation: selected ? "bounce 0.4s" : "none",
          }}
        >
          {data.emoji}
        </div>

        {/* Título */}
        <div
          style={{
            fontWeight: 900,
            fontSize: 20,
            color: selected ? data.color : "#1e293b",
            marginBottom: 6,
            transition: "color 0.2s",
          }}
        >
          {data.title}
        </div>

        {/* Descripción */}
        <p
          style={{
            margin: "0 0 14px",
            fontWeight: 600,
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          {data.description}
        </p>

        {/* Ejemplos */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {data.examples.map((ex, i) => (
            <span
              key={i}
              style={{
                background: selected ? `${data.color}18` : "#f1f5f9",
                color: selected ? data.color : "#64748b",
                fontWeight: 700,
                fontSize: 12,
                borderRadius: 8,
                padding: "3px 9px",
                transition: "all 0.2s",
              }}
            >
              {ex}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          40% { transform: scale(1.2) rotate(-8deg); }
          70% { transform: scale(0.95) rotate(4deg); }
        }
      `}</style>
    </button>
  );
}