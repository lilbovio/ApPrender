import React from "react";

/**
 * LessonCard
 * Muestra una lección disponible para el niño.
 * Props:
 *  - title: string
 *  - subject: "math" | "english"
 *  - grade: number (1-6)
 *  - vakType: "visual" | "auditory" | "kinesthetic"
 *  - progress: number (0-100)
 *  - isLocked: bool
 *  - isCompleted: bool
 *  - onClick: fn
 *  - duration: string  (ej: "10 min")
 *  - emoji: string
 */

const SUBJECT_CONFIG = {
  math: { color: "#4D96FF", bg: "#EFF6FF", label: "Matemáticas", emoji: "🔢" },
  english: { color: "#FF922B", bg: "#FFF4E6", label: "Inglés", emoji: "🔤" },
};

const VAK_CONFIG = {
  visual:      { label: "Visual",      emoji: "👀", color: "#6BCB77" },
  auditory:    { label: "Auditivo",    emoji: "👂", color: "#CC5DE8" },
  kinesthetic: { label: "Kinestésico", emoji: "🙌", color: "#FF6B6B" },
};

export default function LessonCard({
  title = "Lección",
  subject = "math",
  grade = 1,
  vakType = "visual",
  progress = 0,
  isLocked = false,
  isCompleted = false,
  onClick,
  duration = "10 min",
  emoji,
}) {
  const [hovered, setHovered] = React.useState(false);
  const sub = SUBJECT_CONFIG[subject] || SUBJECT_CONFIG.math;
  const vak = VAK_CONFIG[vakType] || VAK_CONFIG.visual;

  const lessonEmoji = emoji || sub.emoji;
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      onMouseEnter={() => !isLocked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isLocked ? "#f8f9fb" : "#fff",
        borderRadius: 22,
        padding: "18px 20px",
        boxShadow: hovered
          ? "0 12px 32px rgba(0,0,0,0.14)"
          : "0 4px 16px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.2s cubic-bezier(.4,2,.6,1)",
        cursor: isLocked ? "not-allowed" : "pointer",
        border: isCompleted
          ? "2.5px solid #6BCB77"
          : `2.5px solid ${hovered ? sub.color : "transparent"}`,
        position: "relative",
        overflow: "hidden",
        opacity: isLocked ? 0.6 : 1,
        userSelect: "none",
      }}
    >
      {/* Fondo decorativo */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: sub.bg,
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: sub.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              {isLocked ? "🔒" : isCompleted ? "✅" : lessonEmoji}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Nunito', 'Fredoka One', sans-serif",
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#1e293b",
                  lineHeight: 1.3,
                  marginBottom: 4,
                }}
              >
                {title}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Tag color={sub.color} bg={sub.bg}>{sub.label}</Tag>
                <Tag color={vak.color} bg={`${vak.color}18`}>
                  {vak.emoji} {vak.label}
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {/* Info row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "#94a3b8",
            }}
          >
            ⏱ {duration} · Grado {grade}
          </span>
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: isCompleted ? "#6BCB77" : sub.color,
            }}
          >
            {isCompleted ? "¡Completado! 🎉" : `${clamped}%`}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 10,
            background: "#e8eef6",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${clamped}%`,
              height: "100%",
              background: isCompleted ? "#6BCB77" : sub.color,
              borderRadius: 8,
              transition: "width 0.6s cubic-bezier(.4,2,.6,1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Tag({ color, bg, children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        background: bg,
        color: color,
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 700,
        fontSize: 11,
        borderRadius: 8,
        padding: "2px 8px",
      }}
    >
      {children}
    </span>
  );
}