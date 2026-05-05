import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavItem from "./NavItem";

/**
 * Navbar
 * Barra de navegación inferior (mobile-first).
 * Tabs: Inicio, Aprender, Materias, Perfil
 */
const NAV_ITEMS = [
  { path: "/home",     label: "Inicio",   emoji: "🏠" },
  { path: "/learn",    label: "Aprender", emoji: "📚" },
  { path: "/subjects", label: "Materias", emoji: "🗂️" },
  { path: "/profile",  label: "Perfil",   emoji: "👤" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // No mostrar navbar en páginas de auth o VAK test
  const hidden = ["/", "/login", "/register", "/vak-test"];
  if (hidden.includes(location.pathname)) return null;

  return (
    <>
      {/* Spacer para que el contenido no quede tapado por la navbar */}
      <div style={{ height: 80 }} />

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 72,
          background: "#ffffff",
          borderTop: "2px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 500,
          padding: "0 8px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            emoji={item.emoji}
            label={item.label}
            isActive={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>
    </>
  );
}