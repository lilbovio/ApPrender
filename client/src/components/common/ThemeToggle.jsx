import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * ThemeToggle
 * Sun/Moon toggle button for switching between light and dark mode
 * Features smooth rotation animation and cozy design
 */
export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={toggleDarkMode}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "none",
        background: isDarkMode 
          ? "linear-gradient(135deg, #2d3548 0%, #3d4560 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: isDarkMode
          ? "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
          : "0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        transition: "all 0.3s ease",
        transform: isHovered ? "scale(1.1) rotate(10deg)" : "scale(1) rotate(0deg)",
      }}
    >
      <div
        style={{
          fontSize: 28,
          transition: "transform 0.5s ease",
          transform: isDarkMode ? "rotate(180deg)" : "rotate(0deg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isDarkMode ? "🌙" : "☀️"}
      </div>

      {/* Tooltip */}
      {isHovered && (
        <div
          style={{
            position: "absolute",
            bottom: -45,
            right: 0,
            background: isDarkMode ? "#2d3548" : "#1e293b",
            color: "#ffffff",
            padding: "8px 14px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
          <div
            style={{
              position: "absolute",
              top: -6,
              right: 20,
              width: 12,
              height: 6,
              background: isDarkMode ? "#2d3548" : "#1e293b",
              clipPath: "polygon(50% 0, 0 100%, 100% 100%)",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </button>
  );
}

// Made with Bob
