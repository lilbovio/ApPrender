import React from "react";

const AVATAR_COLORS = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF",
  "#FF922B", "#CC5DE8", "#20C997", "#F06595",
];

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/**
 * Avatar
 * Props:
 *  - src: string (URL de imagen)
 *  - name: string (nombre del niño, para iniciales y color)
 *  - size: "sm" | "md" | "lg" | "xl"  (default "md")
 *  - onClick: fn
 *  - badge: ReactNode  (elemento pequeño encima, ej estrella)
 */
export default function Avatar({ src, name = "", size = "md", onClick, badge }) {
  const sizes = {
    sm: { box: 36, font: 14, border: 2 },
    md: { box: 52, font: 20, border: 3 },
    lg: { box: 72, font: 28, border: 4 },
    xl: { box: 96, font: 36, border: 4 },
  };
  const { box, font, border } = sizes[size] || sizes.md;
  const bg = getColor(name);
  const initials = getInitials(name);

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: box,
        height: box,
        borderRadius: "50%",
        background: src ? "transparent" : bg,
        border: `${border}px solid #fff`,
        boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
        cursor: onClick ? "pointer" : "default",
        overflow: "visible",
        flexShrink: 0,
        transition: "transform 0.18s, box-shadow 0.18s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.18)";
      }}
      title={name}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: box,
            height: box,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : (
        <span
          style={{
            fontSize: font,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "'Nunito', 'Fredoka One', sans-serif",
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          {initials || "?"}
        </span>
      )}

      {badge && (
        <span
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}