import React from "react";

/**
 * BadgeGrid
 * Muestra la cuadrícula de logros/badges del niño.
 * Props:
 *  - badges: Array<{ id, emoji, name, description, earned, earnedAt }>
 *  - columns: number (default 3)
 */
export default function BadgeGrid({ badges = [], columns = 3 }) {
  const [tooltip, setTooltip] = React.useState(null); // id del badge con tooltip

  if (badges.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          fontFamily: "'Nunito', sans-serif",
          color: "#94a3b8",
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
        <p style={{ margin: 0 }}>¡Completa lecciones para ganar tus primeros logros!</p>
      </div>
    );
  }

  const earned = badges.filter((b) => b.earned).length;

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Contador */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: "#64748b" }}>
          Tus logros
        </span>
        <span
          style={{
            background: "#FFF9E6",
            color: "#92400e",
            fontWeight: 800,
            fontSize: 13,
            borderRadius: 10,
            padding: "3px 10px",
            border: "1.5px solid #FFD93D",
          }}
        >
          ⭐ {earned}/{badges.length}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 12,
        }}
      >
        {badges.map((badge) => (
          <BadgeItem
            key={badge.id}
            badge={badge}
            showTooltip={tooltip === badge.id}
            onToggleTooltip={() =>
              setTooltip((prev) => (prev === badge.id ? null : badge.id))
            }
          />
        ))}
      </div>
    </div>
  );
}

function BadgeItem({ badge, showTooltip, onToggleTooltip }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
    >
      <button
        onClick={onToggleTooltip}
        style={{
          width: "100%",
          aspectRatio: "1",
          borderRadius: 20,
          border: badge.earned ? "3px solid #FFD93D" : "2.5px solid #e2e8f0",
          background: badge.earned
            ? "linear-gradient(135deg, #FFF9E6 0%, #FFF3CD 100%)"
            : "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          cursor: "pointer",
          transition: "all 0.2s",
          transform: hovered && badge.earned ? "scale(1.08) rotate(-4deg)" : "scale(1)",
          boxShadow: badge.earned
            ? "0 4px 16px rgba(255,215,0,0.3)"
            : "none",
          filter: badge.earned ? "none" : "grayscale(1) opacity(0.4)",
          padding: 0,
        }}
        title={badge.name}
      >
        {badge.emoji}
      </button>

      <span
        style={{
          fontWeight: 700,
          fontSize: 11,
          color: badge.earned ? "#1e293b" : "#94a3b8",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {badge.name}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e293b",
            color: "#fff",
            borderRadius: 12,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
            zIndex: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
            maxWidth: 180,
            whiteSpace: "normal",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {badge.earned ? (
            <>
              <div>{badge.description}</div>
              {badge.earnedAt && (
                <div style={{ opacity: 0.65, marginTop: 4, fontSize: 10 }}>
                  {new Date(badge.earnedAt).toLocaleDateString("es-MX")}
                </div>
              )}
            </>
          ) : (
            <div style={{ opacity: 0.8 }}>🔒 {badge.description}</div>
          )}
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 12,
              height: 6,
              background: "#1e293b",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }}
          />
        </div>
      )}
    </div>
  );
}