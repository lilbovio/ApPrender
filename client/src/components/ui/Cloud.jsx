// Cloud — decorative sky element (DESIGN.md section 12, landing). Always aria-hidden.

export default function Cloud({ width = 120, className, style }) {
  return (
    <svg
      width={width}
      height={width / 2}
      viewBox="0 0 120 60"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", ...style }}
    >
      <path
        d="M18 46h84a16 16 0 0 0 0-32 22 22 0 0 0-41-5A17 17 0 0 0 18 46Z"
        style={{ fill: "var(--surface)", stroke: "var(--hairline)" }}
        strokeWidth={2}
      />
    </svg>
  );
}
