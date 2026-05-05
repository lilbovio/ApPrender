import React, { useState } from "react";

/**
 * QuizQuestion
 * Componente reutilizable para preguntas de quiz en lecciones.
 * Soporta los 3 tipos VAK:
 *  - visual: muestra imagen/emoji grande
 *  - auditory: botón de escuchar la pregunta (Web Speech API)
 *  - kinesthetic: arrastrar/opción de toque con feedback táctil
 *
 * Props:
 *  - question: string
 *  - options: Array<string>
 *  - correctIndex: number
 *  - vakType: "visual" | "auditory" | "kinesthetic"
 *  - image: string (URL imagen, para visual)
 *  - emoji: string
 *  - onAnswer: fn(isCorrect: bool, selectedIndex: number)
 *  - questionNumber: number
 *  - totalQuestions: number
 */

export default function QuizQuestion({
  question = "",
  options = [],
  correctIndex = 0,
  vakType = "visual",
  image,
  emoji,
  onAnswer,
  questionNumber = 1,
  totalQuestions = 1,
}) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === correctIndex;
    setTimeout(() => onAnswer?.(correct, idx), 900);
  };

  // Auditivo: leer la pregunta en voz alta
  const speak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(question);
    utt.lang = "es-MX";
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  };

  const optionColors = ["#4D96FF", "#FF922B", "#6BCB77", "#CC5DE8"];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        fontFamily: "'Nunito', 'Fredoka One', sans-serif",
      }}
    >
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {Array.from({ length: totalQuestions }, (_, i) => (
          <div
            key={i}
            style={{
              width: i === questionNumber - 1 ? 24 : 10,
              height: 10,
              borderRadius: 6,
              background: i < questionNumber - 1 ? "#6BCB77" : i === questionNumber - 1 ? "#4D96FF" : "#e2e8f0",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      {/* Imagen/emoji (visual y kinesthetic) */}
      {(image || emoji) && vakType !== "auditory" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 100,
          }}
        >
          {image ? (
            <img
              src={image}
              alt="pregunta"
              style={{ maxHeight: 140, borderRadius: 20, objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: 72, lineHeight: 1, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.14))" }}>
              {emoji}
            </span>
          )}
        </div>
      )}

      {/* Tarjeta de pregunta */}
      <div
        style={{
          background: "#EFF6FF",
          borderRadius: 20,
          padding: "18px 22px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: 20,
            color: "#1e293b",
            flex: 1,
            lineHeight: 1.4,
          }}
        >
          {question}
        </p>

        {/* Auditory: botón de escuchar */}
        {vakType === "auditory" && (
          <button
            onClick={speak}
            style={{
              background: "#4D96FF",
              border: "none",
              borderRadius: "50%",
              width: 52,
              height: 52,
              cursor: "pointer",
              fontSize: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(77,150,255,0.35)",
              flexShrink: 0,
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            title="Escuchar pregunta"
          >
            🔊
          </button>
        )}
      </div>

      {/* Opciones */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === correctIndex;
          let bg = "#fff";
          let border = "2.5px solid #e2e8f0";
          let textColor = "#1e293b";
          let icon = null;

          if (answered) {
            if (isCorrect) {
              bg = "#f0fdf4"; border = "2.5px solid #6BCB77"; textColor = "#166534"; icon = "✅";
            } else if (isSelected && !isCorrect) {
              bg = "#fff5f5"; border = "2.5px solid #FF6B6B"; textColor = "#991b1b"; icon = "❌";
            }
          } else if (isSelected) {
            bg = "#EFF6FF"; border = `2.5px solid ${optionColors[idx % optionColors.length]}`;
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              style={{
                background: bg,
                border,
                borderRadius: 16,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: answered ? "default" : "pointer",
                transition: "all 0.18s",
                textAlign: "left",
                width: "100%",
                transform:
                  vakType === "kinesthetic" && isSelected && !answered
                    ? "scale(0.97)"
                    : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (!answered) e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: optionColors[idx % optionColors.length] + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 15,
                  color: optionColors[idx % optionColors.length],
                  flexShrink: 0,
                }}
              >
                {icon || String.fromCharCode(65 + idx)}
              </span>
              <span style={{ fontWeight: 700, fontSize: 16, color: textColor, flex: 1 }}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div
          style={{
            borderRadius: 16,
            padding: "14px 18px",
            background: selected === correctIndex ? "#f0fdf4" : "#fff5f5",
            border: `2px solid ${selected === correctIndex ? "#6BCB77" : "#FF6B6B"}`,
            fontWeight: 700,
            fontSize: 17,
            color: selected === correctIndex ? "#166534" : "#991b1b",
            textAlign: "center",
            animation: "popIn 0.3s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          {selected === correctIndex
            ? "¡Excelente! 🎉 ¡Lo lograste!"
            : `¡Casi! 💪 La respuesta era: ${options[correctIndex]}`}
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}