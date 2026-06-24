import React from "react";

/**
 * Card
 * Props:
 *  - variant: "default" | "colored" | "lesson" | "flat"
 *  - color: string (hex, p.ej. para colorear la franja superior)
 *  - onClick: fn
 *  - hoverable: bool
 *  - padding: string (css)
 *  - style: object
 *  - children
 */

const CARD_BASE = {
  background: "var(--card)",
  borderRadius: 24,
  boxShadow: "var(--shadow-md)",
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.18s, box-shadow 0.18s",
};

export default function Card({
  variant = "default",
  color,
  onClick,
  hoverable = !!onClick,
  padding = "24px",
  style: extraStyle = {},
  children,
}) {
  const [hovered, setHovered] = React.useState(false);

  const hoverStyles = hoverable && hovered
    ? { transform: "translateY(-4px) scale(1.01)", boxShadow: "var(--shadow-lg)" }
    : {};

  const variantStyles = {
    default: {},
    colored: { background: color || "var(--bg-secondary)" },
    lesson: { background: "var(--card)", borderLeft: `6px solid ${color || "var(--primary)"}` },
    flat: { boxShadow: "none", border: "2px solid var(--border)" },
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...CARD_BASE,
        ...variantStyles[variant],
        ...hoverStyles,
        padding,
        cursor: onClick ? "pointer" : "default",
        ...extraStyle,
      }}
    >
      {/* Franja de color superior para variante "lesson" */}
      {variant === "colored" && color && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: color,
            borderRadius: "24px 24px 0 0",
          }}
        />
      )}

      {children}
    </div>
  );
}