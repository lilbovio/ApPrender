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
  background: "#ffffff",
  borderRadius: 24,
  boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
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
    ? { transform: "translateY(-4px) scale(1.01)", boxShadow: "0 10px 32px rgba(0,0,0,0.16)" }
    : {};

  const variantStyles = {
    default: {},
    colored: { background: color || "#EFF6FF" },
    lesson: { background: "#FEFEFE", borderLeft: `6px solid ${color || "#4D96FF"}` },
    flat: { boxShadow: "none", border: "2px solid #eee" },
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