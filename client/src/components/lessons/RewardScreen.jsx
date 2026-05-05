import React, { useEffect, useState } from "react";

/**
 * RewardScreen
 * Pantalla de recompensa al terminar una lección.
 * Props:
 *  - score: number (0-100)
 *  - correctAnswers: number
 *  - totalQuestions: number
 *  - xpEarned: number
 *  - onContinue: fn
 *  - onRetry: fn
 *  - lessonTitle: string
 *  - newBadge: { emoji, name } | null
 */

const STAR_THRESHOLDS = [
  { min: 80, stars: 3, message: "¡Eres increíble! 🏆", color: "#FFD93D" },
  { min: 50, stars: 2, message: "¡Muy bien hecho! 🎉", color: "#4D96FF" },
  { min: 0,  stars: 1, message: "¡Sigue practicando! 💪", color: "#FF922B" },
];

function getResult(score) {
  return STAR_THRESHOLDS.find((t) => score >= t.min) || STAR_THRESHOLDS[2];
}

// Confeti simple con CSS
function Confetti() {
  const pieces = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    color: ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#CC5DE8","#FF922B"][i % 6],
    left: `${4 + i * 4.2}%`,
    delay: `${(i * 0.09).toFixed(2)}s`,
    duration: `${1.2 + (i % 4) * 0.3}s`,
    size: 8 + (i % 4) * 4,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: "-10%",
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.id % 3 === 0 ? "50%" : 3,
            animation: `fall ${p.duration} ${p.delay} ease-in forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function RewardScreen({
  score = 0,
  correctAnswers = 0,
  totalQuestions = 0,
  xpEarned = 0,
  onContinue,
  onRetry,
  lessonTitle = "Lección",
  newBadge = null,
}) {
  const result = getResult(score);
  const [showConfetti, setShowConfetti] = useState(result.stars === 3);
  const [starsShown, setStarsShown] = useState(0);

  useEffect(() => {
    // Animar estrellas una a una
    let i = 0;
    const t = setInterval(() => {
      i++;
      setStarsShown(i);
      if (i >= result.stars) clearInterval(t);
    }, 350);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3500);
    return () => { clearInterval(t); clearTimeout(confettiTimer); };
  }, [result.stars]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(160deg, #EFF6FF 0%, #FFF4E6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 990,
        padding: 20,
        fontFamily: "'Nunito', 'Fredoka One', sans-serif",
      }}
    >
      {showConfetti && <Confetti />}

      <div
        style={{
          background: "#fff",
          borderRadius: 32,
          padding: "36px 32px",
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
          textAlign: "center",
          animation: "popIn 0.4s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* Trophy emoji */}
        <div style={{ fontSize: 64, marginBottom: 8, lineHeight: 1 }}>
          {result.stars === 3 ? "🏆" : result.stars === 2 ? "🌟" : "💪"}
        </div>

        {/* Stars */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              style={{
                fontSize: 40,
                filter: i < starsShown ? "none" : "grayscale(1) opacity(0.25)",
                transition: "filter 0.3s, transform 0.3s",
                transform: i < starsShown ? "scale(1.15)" : "scale(1)",
                display: "inline-block",
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        <h2 style={{ margin: "0 0 4px", fontWeight: 900, fontSize: 24, color: result.color }}>
          {result.message}
        </h2>
        <p style={{ margin: "0 0 20px", color: "#64748b", fontWeight: 600, fontSize: 15 }}>
          {lessonTitle}
        </p>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Stat emoji="✅" value={`${correctAnswers}/${totalQuestions}`} label="Correctas" color="#6BCB77" />
          <Stat emoji="💯" value={`${score}%`} label="Puntaje" color="#4D96FF" />
          <Stat emoji="⚡" value={`+${xpEarned}`} label="XP" color="#FFD93D" />
        </div>

        {/* Badge nuevo */}
        {newBadge && (
          <div
            style={{
              background: "#FFF9E6",
              border: "2px solid #FFD93D",
              borderRadius: 16,
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 32 }}>{newBadge.emoji}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#92400e" }}>
                🎉 ¡Nuevo logro!
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#b45309" }}>
                {newBadge.name}
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
          <button
            onClick={onContinue}
            style={{
              background: "#4D96FF",
              color: "#fff",
              border: "none",
              borderRadius: 18,
              padding: "14px 24px",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 6px 0 #1a5bbf",
              transition: "all 0.15s",
              width: "100%",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#2979e8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#4D96FF"; }}
          >
            ¡Continuar! 🚀
          </button>

          {result.stars < 3 && onRetry && (
            <button
              onClick={onRetry}
              style={{
                background: "transparent",
                color: "#64748b",
                border: "2px solid #e2e8f0",
                borderRadius: 18,
                padding: "12px 24px",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Intentar de nuevo 🔄
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}

function Stat({ emoji, value, label, color }) {
  return (
    <div
      style={{
        background: `${color}14`,
        borderRadius: 16,
        padding: "10px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <span style={{ fontWeight: 800, fontSize: 18, color }}>{value}</span>
      <span style={{ fontWeight: 600, fontSize: 11, color: "#64748b" }}>{label}</span>
    </div>
  );
}