import React, { useEffect } from "react";

/**
 * Modal
 * Props:
 *  - isOpen: bool
 *  - onClose: fn
 *  - title: string
 *  - emoji: string  (emoji decorativo en el header)
 *  - children
 *  - footer: ReactNode
 *  - size: "sm" | "md" | "lg"
 *  - closable: bool (default true)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  emoji,
  children,
  footer,
  size = "md",
  closable = true,
}) {
  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!closable) return;
    const handler = (e) => { if (e.key === "Escape" && isOpen) onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, closable]);

  if (!isOpen) return null;

  const widths = { sm: 360, md: 480, lg: 640 };
  const maxW = widths[size] || widths.md;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.18s ease",
      }}
      onClick={(e) => { if (closable && e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 28,
          width: "100%",
          maxWidth: maxW,
          boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
          overflow: "hidden",
          animation: "popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Header */}
        {(title || emoji) && (
          <div
            style={{
              padding: "22px 28px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "2px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {emoji && <span style={{ fontSize: 28 }}>{emoji}</span>}
              {title && (
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Nunito', 'Fredoka One', sans-serif",
                    fontWeight: 800,
                    fontSize: 20,
                    color: "#1e293b",
                  }}
                >
                  {title}
                </h2>
              )}
            </div>

            {closable && (
              <button
                onClick={onClose}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  transition: "background 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: "16px 28px 24px",
              borderTop: "2px solid #f1f5f9",
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn {
          from { transform: scale(0.88); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}