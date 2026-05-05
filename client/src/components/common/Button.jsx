import React from "react";

/**
 * Button
 * Props:
 *  - variant: "primary" | "secondary" | "danger" | "ghost" | "success"
 *  - size: "sm" | "md" | "lg"
 *  - icon: ReactNode
 *  - iconPosition: "left" | "right"
 *  - fullWidth: bool
 *  - loading: bool
 *  - disabled: bool
 *  - onClick: fn
 *  - children
 */

const VARIANTS = {
  primary:   { bg: "#4D96FF", hover: "#2979e8", text: "#fff", shadow: "0 6px 0 #1a5bbf" },
  secondary: { bg: "#FFD93D", hover: "#f5c800", text: "#4a3000", shadow: "0 6px 0 #c8a000" },
  danger:    { bg: "#FF6B6B", hover: "#e84444", text: "#fff", shadow: "0 6px 0 #b52020" },
  ghost:     { bg: "transparent", hover: "#f0f4ff", text: "#4D96FF", shadow: "none" },
  success:   { bg: "#6BCB77", hover: "#45b554", text: "#fff", shadow: "0 6px 0 #2e8c3e" },
};

const SIZES = {
  sm: { padding: "8px 18px", fontSize: 14, borderRadius: 14, minH: 36 },
  md: { padding: "12px 28px", fontSize: 17, borderRadius: 18, minH: 48 },
  lg: { padding: "16px 40px", fontSize: 21, borderRadius: 22, minH: 60 },
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  children,
  type = "button",
  style: extraStyle = {},
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  const [pressed, setPressed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  const bg = hovered && !isDisabled ? v.hover : v.bg;
  const boxShadow = isDisabled ? "none" : pressed ? "none" : v.shadow;
  const transform = pressed && !isDisabled ? "translateY(4px)" : "translateY(0)";

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: isDisabled ? "#ccc" : bg,
        color: isDisabled ? "#888" : v.text,
        border: "none",
        borderRadius: s.borderRadius,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 800,
        fontFamily: "'Nunito', 'Fredoka One', sans-serif",
        minHeight: s.minH,
        width: fullWidth ? "100%" : "auto",
        cursor: isDisabled ? "not-allowed" : "pointer",
        boxShadow,
        transform,
        transition: "background 0.15s, transform 0.1s, box-shadow 0.1s",
        outline: "none",
        letterSpacing: "0.01em",
        userSelect: "none",
        position: "relative",
        ...extraStyle,
      }}
    >
      {loading && (
        <span
          style={{
            width: 18,
            height: 18,
            border: `3px solid ${v.text}44`,
            borderTop: `3px solid ${v.text}`,
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
          }}
        />
      )}
      {!loading && icon && iconPosition === "left" && <span style={{ display: "flex" }}>{icon}</span>}
      {!loading && <span>{children}</span>}
      {!loading && icon && iconPosition === "right" && <span style={{ display: "flex" }}>{icon}</span>}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}