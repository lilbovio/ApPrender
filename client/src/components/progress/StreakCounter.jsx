import React from "react";

/**
 * StreakCounter
 * Muestra la racha de días consecutivos del niño.
 * Props:
 *  - streak: number (días consecutivos)
 *  - lastWeek: Array<bool> (7 bools, true = día con actividad)
 *  - compact: bool (versión pequeña para navbar/header)
 */

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export default function StreakCounter({ streak = 0, lastWeek = [], compact = false }) {
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 600);
    return () => clearTimeout(t);
  }, [streak]);

  if (compact) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: streak > 0 ? "#FFF4E6" : "#f8fafc",
          border: `2px solid ${streak > 0 ? "#FF922B" : "#e2e8f0"}`,
          borderRadius: 12,
          padding: "4px 12px",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 14,
          color: streak > 0 ? "#c2410c" : "#94a3b8",
        }}
      >
        🔥 {streak}
      </div>
    );
  }

  const normalizedWeek = Array.from({ length: 7 }, (_, i) => lastWeek[i] ?? false);

  return (
    <div
      style={{
        background: streak > 0
          ? "linear-gradient(135deg, #FFF4E6 0%, #FFF9E6 100%)"
          : "#f8fafc",
        borderRadius: 22,
        padding: "20px 22px",
        fontFamily: "'Nunito', 'Fredoka One', sans-serif",
        border: `2px solid ${streak > 0 ? "#FFD93D" : "#e2e8f0"}`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 36,
              lineHeight: 1,
              display: "inline-block",
              animation: animate && streak > 0 ? "bounce 0.5s" : "none",
            }}
          >
            🔥
          </span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 28, color: streak > 0 ? "#c2410c" : "#94a3b8", lineHeight: 1 }}>
              {streak}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#94a3b8" }}>
              {streak === 1 ? "día seguido" : "días seguidos"}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#64748b" }}>Racha actual</div>
          {streak >= 7 && (
            <div style={{ fontWeight: 800, fontSize: 12, color: "#FF922B" }}>¡Semana completa! 🏅</div>
          )}
        </div>
      </div>

      {/* Week dots */}
      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        {normalizedWeek.map((active, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                maxWidth: 38,
                borderRadius: 12,
                background: active
                  ? "linear-gradient(135deg, #FF922B, #FFD93D)"
                  : "#e8eef6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                boxShadow: active ? "0 3px 10px rgba(255,146,43,0.35)" : "none",
                transition: "all 0.2s",
              }}
            >
              {active ? "🔥" : ""}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>
              {DAY_LABELS[idx]}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          40% { transform: scale(1.3) rotate(-10deg); }
          70% { transform: scale(0.95) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}