import React, { useState } from "react";

/**
 * Input
 * Props:
 *  - label: string
 *  - type: string
 *  - placeholder: string
 *  - value, onChange
 *  - error: string
 *  - icon: ReactNode (izquierda)
 *  - rightIcon: ReactNode
 *  - disabled: bool
 *  - hint: string
 */
export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon,
  rightIcon,
  disabled = false,
  hint,
  name,
  autoComplete,
  style: extraStyle = {},
}) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPass ? "text" : type;

  const borderColor = error
    ? "#FF6B6B"
    : focused
    ? "#4D96FF"
    : "#dde3f0";

  const shadowColor = error
    ? "0 0 0 3px rgba(255,107,107,0.18)"
    : focused
    ? "0 0 0 3px rgba(77,150,255,0.18)"
    : "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", ...extraStyle }}>
      {label && (
        <label
          style={{
            fontFamily: "'Nunito', 'Fredoka One', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#334155",
            marginLeft: 2,
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: disabled ? "#f8f9fb" : "#fff",
          border: `2.5px solid ${borderColor}`,
          borderRadius: 16,
          padding: "0 14px",
          gap: 8,
          transition: "border-color 0.18s, box-shadow 0.18s",
          boxShadow: shadowColor,
        }}
      >
        {icon && (
          <span style={{ color: "#94a3b8", display: "flex", flexShrink: 0 }}>
            {icon}
          </span>
        )}

        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          name={name}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "'Nunito', 'Fredoka One', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: "#1e293b",
            padding: "14px 0",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              padding: 0,
              fontSize: 18,
            }}
            tabIndex={-1}
          >
            {showPass ? "🙈" : "👁️"}
          </button>
        )}

        {rightIcon && !isPassword && (
          <span style={{ color: "#94a3b8", display: "flex", flexShrink: 0 }}>
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#FF6B6B",
            marginLeft: 4,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ⚠️ {error}
        </span>
      )}

      {hint && !error && (
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13,
            color: "#94a3b8",
            marginLeft: 4,
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}