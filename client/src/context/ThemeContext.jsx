import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * ThemeContext
 * Maneja el tema de la app (colores por materia/VAK, modo claro).
 * Los temas son siempre claros y vibrantes — apropiados para niños.
 */

const ThemeContext = createContext(null);

// Paletas por tema
export const THEMES = {
  default: {
    name: "default",
    primary: "#4D96FF",
    secondary: "#FFD93D",
    accent: "#6BCB77",
    bg: "#F8FAFF",
    card: "#FFFFFF",
    text: "#1e293b",
    textSoft: "#64748b",
  },
  math: {
    name: "math",
    primary: "#4D96FF",
    secondary: "#60C5FA",
    accent: "#FFD93D",
    bg: "#EFF6FF",
    card: "#FFFFFF",
    text: "#1e3a5f",
    textSoft: "#4a7ab5",
  },
  english: {
    name: "english",
    primary: "#FF922B",
    secondary: "#FFD93D",
    accent: "#6BCB77",
    bg: "#FFF8F0",
    card: "#FFFFFF",
    text: "#7c2d12",
    textSoft: "#c2410c",
  },
  visual: {
    name: "visual",
    primary: "#4D96FF",
    secondary: "#60C5FA",
    accent: "#A78BFA",
    bg: "#EFF6FF",
    card: "#FFFFFF",
    text: "#1e293b",
    textSoft: "#64748b",
  },
  auditory: {
    name: "auditory",
    primary: "#CC5DE8",
    secondary: "#A78BFA",
    accent: "#60C5FA",
    bg: "#F8F0FF",
    card: "#FFFFFF",
    text: "#1e293b",
    textSoft: "#64748b",
  },
  kinesthetic: {
    name: "kinesthetic",
    primary: "#FF6B6B",
    secondary: "#FF922B",
    accent: "#FFD93D",
    bg: "#FFF5F5",
    card: "#FFFFFF",
    text: "#1e293b",
    textSoft: "#64748b",
  },
};

// Aplica las variables CSS globales al :root
function applyCSSVariables(theme) {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", theme.primary);
  root.style.setProperty("--color-secondary", theme.secondary);
  root.style.setProperty("--color-accent", theme.accent);
  root.style.setProperty("--color-bg", theme.bg);
  root.style.setProperty("--color-card", theme.card);
  root.style.setProperty("--color-text", theme.text);
  root.style.setProperty("--color-text-soft", theme.textSoft);
}

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState("default");
  const theme = THEMES[themeName] || THEMES.default;

  useEffect(() => {
    applyCSSVariables(theme);
    document.body.style.background = theme.bg;
  }, [theme]);

  // Cambiar tema (ej. cuando el niño elige materia)
  const setTheme = (name) => {
    if (THEMES[name]) setThemeName(name);
  };

  // Resetear al default
  const resetTheme = () => setThemeName("default");

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, resetTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}

export default ThemeContext;