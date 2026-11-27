// Custom 2 px round-cap stroke icon set (DESIGN.md section 5). No emoji.

const ICONS = {
  home: [{ tag: "path", d: "M4 11 12 4l8 7v9h-6v-6h-4v6H4Z" }],
  book: [
    { tag: "path", d: "M12 6c-2-2-5-2-8-1v13c3-1 6-1 8 1 2-2 5-2 8-1V5c-3-1-6-1-8 1Z" },
    { tag: "path", d: "M12 6v13" },
  ],
  star: [{ tag: "path", d: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9Z" }],
  user: [
    { tag: "circle", cx: 12, cy: 8, r: 4 },
    { tag: "path", d: "M4 21c0-4 3.6-7 8-7s8 3 8 7" },
  ],
  play: [{ tag: "path", d: "m8 5 11 7-11 7Z" }],
  check: [{ tag: "path", d: "m5 12 5 5L20 7" }],
  lock: [
    { tag: "rect", x: 5, y: 10, width: 14, height: 11, rx: 3 },
    { tag: "path", d: "M8 10V7a4 4 0 0 1 8 0v3" },
  ],
  arrow: [{ tag: "path", d: "M5 12h14m-6-6 6 6-6 6" }],
  eye: [
    { tag: "path", d: "M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" },
    { tag: "circle", cx: 12, cy: 12, r: 3 },
  ],
  ear: [
    { tag: "path", d: "M7 13a5 5 0 0 1 10 0c0 4-4 4-4 7" },
    { tag: "path", d: "M10 13a2 2 0 0 1 4 0" },
  ],
  hand: [
    {
      tag: "path",
      d: "M8 14V8a2 2 0 0 1 4 0v4V6a2 2 0 0 1 4 0v6V8a2 2 0 0 1 4 0v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-3a2 2 0 0 1 4 0",
    },
  ],
  apple: [
    { tag: "path", d: "M12 8c-3-3-8-1-8 5 0 5 4 9 8 9s8-4 8-9c0-6-5-8-8-5Z" },
    { tag: "path", d: "M12 8c0-3 2-5 5-5" },
  ],
  drag: [
    {
      tag: "path",
      d: "M12 3v18M3 12h18M12 3l-3 3m3-3 3 3M12 21l-3-3m3 3 3-3M3 12l3-3m-3 3 3 3M21 12l-3-3m3 3-3 3",
    },
  ],
  replay: [{ tag: "path", d: "M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" }],
  back: [{ tag: "path", d: "M19 12H5m6-6-6 6 6 6" }],
  logout: [
    {
      tag: "path",
      d: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10",
    },
  ],
  trophy: [
    { tag: "path", d: "M8 4h8v5a4 4 0 0 1-8 0V4Z" },
    { tag: "path", d: "M8 6H5a3 3 0 0 0 3 4" },
    { tag: "path", d: "M16 6h3a3 3 0 0 1-3 4" },
    { tag: "path", d: "M12 13v7" },
    { tag: "path", d: "M9 20h6" },
    { tag: "path", d: "M10 17h4" },
  ],
  medal: [
    { tag: "path", d: "M8 3l4 8 4-8" },
    { tag: "path", d: "M12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" },
    { tag: "path", d: "M12 14l1 2h2l-1.6 1.2.6 2-2-1.2-2 1.2.6-2L9 16h2Z" },
  ],
};

export const ICON_NAMES = Object.keys(ICONS);

function renderShape(shape, index) {
  const { tag, ...attrs } = shape;
  const Tag = tag;
  return <Tag key={index} {...attrs} />;
}

/**
 * Icon — inline stroke SVG, 24 x 24 viewBox, stroke currentColor.
 * Without `title` it is decorative (aria-hidden). With `title` it is an image.
 */
export default function Icon({ name, size = 24, title, className }) {
  const shapes = ICONS[name];
  if (!shapes) return null;

  const labelled = Boolean(title);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : "true"}
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      {labelled && <title>{title}</title>}
      {shapes.map(renderShape)}
    </svg>
  );
}
