import React from "react";

/**
 * Loader
 * Props:
 *  - size: "sm" | "md" | "lg"
 *  - fullScreen: bool  (ocupa toda la pantalla con overlay)
 *  - message: string  (texto debajo del loader)
 *  - color: string
 */

const EMOJIS = ["⭐", "🌟", "✨", "💫"];

export default function Loader({
  size = "md",
  fullScreen = false,
  message = "Cargando...",
  color = "#4D96FF",
}) {
  const [emojiIdx, setEmojiIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setEmojiIdx((i) => (i + 1) % EMOJIS.length), 400);
    return () => clearInterval(t);
  }, []);

  const sizes = { sm: 32, md: 56, lg: 80 };
  const box = sizes[size] || sizes.md;
  const fontSize = { sm: 20, md: 36, lg: 52 }[size] || 36;

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      {/* Spinner animado */}
      <div style={{ position: "relative", width: box, height: box }}>
        <svg
          width={box}
          height={box}
          viewBox="0 0 56 56"
          style={{ animation: "rotate 1s linear infinite" }}
        >
          <circle
            cx="28"
            cy="28"
            r="22"
            fill="none"
            stroke={`${color}22`}
            strokeWidth="5"
          />
          <circle
            cx="28"
            cy="28"
            r="22"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="80"
            strokeDashoffset="20"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: fontSize * 0.55,
            lineHeight: 1,
          }}
        >
          {EMOJIS[emojiIdx]}
        </div>
      </div>

      {message && (
        <p
          style={{
            fontFamily: "'Nunito', 'Fredoka One', sans-serif",
            fontWeight: 700,
            fontSize: size === "sm" ? 13 : size === "lg" ? 20 : 16,
            color: "#334155",
            margin: 0,
            textAlign: "center",
          }}
        >
          {message}
        </p>
      )}

      <style>{`
        @keyframes rotate { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}