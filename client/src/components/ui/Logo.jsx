// ApPrender mark: open book with a star, drawn with the same 2.5 px stroke family as Pilo.

/** A number is read as px; a string is any CSS length, e.g. "var(--landing-logo)". */
const toLength = (v) => (typeof v === "number" ? `${v}px` : v);

/**
 * size: mark width/height. wordSize: font size of the "ApPrender" word (defaults to 29% of size).
 * Both accept numbers (px) or CSS lengths, so callers can switch sizes per breakpoint with
 * CSS custom properties instead of overriding inline styles.
 */
export default function Logo({ size = 104, wordSize, withWord = false, className }) {
  const markSize = toLength(size);
  const wordFont =
    wordSize != null
      ? toLength(wordSize)
      : typeof size === "number"
        ? `${Math.round(size * 0.29)}px`
        : `calc(${markSize} * 0.29)`;

  const mark = (
    <svg
      viewBox="0 0 120 120"
      role={withWord ? undefined : "img"}
      aria-label={withWord ? undefined : "Logo ApPrender"}
      aria-hidden={withWord ? "true" : undefined}
      focusable="false"
      style={{ display: "block", flexShrink: 0, width: markSize, height: markSize }}
    >
      <path
        d="M18 34c14-6 28-6 42 2v56c-14-8-28-8-42-2Z"
        style={{ fill: "var(--english-surface)", stroke: "var(--ink)" }}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path
        d="M102 34c-14-6-28-6-42 2v56c14-8 28-8 42-2Z"
        style={{ fill: "var(--accent-soft)", stroke: "var(--ink)" }}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path
        d="M60 36v56"
        style={{ fill: "none", stroke: "var(--ink)" }}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="m60 12 5 10 11 1.6-8 7.8 1.9 11L60 37l-9.9 5.4 1.9-11-8-7.8L55 22Z"
        style={{ fill: "var(--butter)", stroke: "var(--ink)" }}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );

  if (!withWord) {
    return <span className={className} style={{ display: "inline-block" }}>{mark}</span>;
  }

  return (
    <span
      className={className}
      style={{
        display: "inline-grid",
        justifyItems: "center",
        gap: 2,
      }}
    >
      {mark}
      <span
        style={{
          fontFamily: "var(--font-ui)",
          fontWeight: 600,
          fontSize: wordFont,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          color: "var(--ink)",
        }}
      >
        ApPrender
      </span>
    </span>
  );
}
