import React from "react";

/**
 * XPBar
 * Barra de experiencia con niveles tipo videojuego.
 * Props:
 *  - xp: number  (XP total del niño)
 *  - compact: bool
 */

// XP por nivel: nivel 1 = 0 XP, nivel 2 = 100, nivel 3 = 250, etc.
const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];

const LEVEL_NAMES = [
  "Explorador",    // 1
  "Aprendiz",      // 2
  "Estudioso",     // 3
  "Pensador",      // 4
  "Sabio",         // 5
  "Genio",         // 6
  "Maestro",       // 7
  "Leyenda",       // 8
  "Campeón",       // 9
  "Superestrella", // 10
];

const LEVEL_EMOJIS = ["🌱","📖","✏️","💡","🦉","🧠","🎓","⚡","🏆","🌟"];

export function getLevel(xp) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  level = Math.min(level, 10);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000;
  const progress = Math.min(100, Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100));
  return {
    level,
    name: LEVEL_NAMES[level - 1],
    emoji: LEVEL_EMOJIS[level - 1],
    xpInLevel: xp - currentThreshold,
    xpNeeded: nextThreshold - currentThreshold,
    progress,
  };
}

export default function XPBar({ xp = 0, compact = false }) {
  const { level, name, emoji, xpInLevel, xpNeeded, progress } = getLevel(xp);
  const [displayedProgress, setDisplayedProgress] = React.useState(0);

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setDisplayedProgress(progress), 50);
    });
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  if (compact) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#EFF6FF",
          border: "2px solid #4D96FF",
          borderRadius: 12,
          padding: "4px 12px",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 14,
          color: "#1d4ed8",
        }}
      >
        {emoji} Nv.{level}
        <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: 12 }}>
          {xp} XP
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)",
        borderRadius: 22,
        padding: "20px 22px",
        fontFamily: "'Nunito', 'Fredoka One', sans-serif",
        border: "2px solid #bfdbfe",
      }}
    >
      {/* Level info */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "#4D96FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              boxShadow: "0 4px 14px rgba(77,150,255,0.35)",
            }}
          >
            {emoji}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#1e293b", lineHeight: 1 }}>
              Nivel {level}
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#4D96FF" }}>
              {name}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 900, fontSize: 22, color: "#1d4ed8" }}>
            ⚡ {xp}
          </div>
          <div style={{ fontWeight: 600, fontSize: 11, color: "#64748b" }}>XP total</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            height: 16,
            background: "#dbeafe",
            borderRadius: 10,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${displayedProgress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #4D96FF, #60C5FA)",
              borderRadius: 10,
              transition: "width 0.9s cubic-bezier(.4,2,.6,1)",
              position: "relative",
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
                height: "45%",
                background: "rgba(255,255,255,0.3)",
                borderRadius: 10,
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#64748b" }}>
        <span>{xpInLevel} / {xpNeeded} XP</span>
        <span>{progress}% para nivel {level + 1}</span>
      </div>
    </div>
  );
}