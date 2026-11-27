// Pilo — the paper-plane mascot (DESIGN.md section 5). Appears once per screen.
// No animation lives here: motion is applied by the parent wrapper.

const INK = { stroke: "var(--ink)", fill: "none" };

export default function Pilo({ size = 56, className, label }) {
  const labelled = Boolean(label);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? label : undefined}
      aria-hidden={labelled ? undefined : "true"}
      focusable="false"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        d="M8 40 70 12 52 68 38 48 18 56Z"
        style={{ fill: "var(--accent-soft)", stroke: "var(--ink)" }}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M38 48 70 12 52 68"
        style={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={32} cy={38} r={2.6} style={{ fill: "var(--ink)" }} />
      <circle cx={46} cy={32} r={2.6} style={{ fill: "var(--ink)" }} />
      <circle cx={26} cy={44} r={3} style={{ fill: "var(--butter)" }} />
    </svg>
  );
}
