/**
 * PictureArt — stroke illustrations for the picture items that appear in lesson data.
 * Same family as Pilo and the logo: ink outline, stroke-width 2, round caps and joins,
 * flat fills from the palette tokens only. Decorative: the parent card carries the label.
 */
const INK = "var(--ink)";

const line = {
  fill: "none",
  stroke: INK,
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const shape = (fill) => ({ ...line, fill });

const ART = {
  dog: (
    <>
      <path d="M19 24C11 26 10 40 16 45C19 41 20 31 21 26Z" style={shape("var(--math-surface)")} />
      <path d="M45 24C53 26 54 40 48 45C45 41 44 31 43 26Z" style={shape("var(--math-surface)")} />
      <circle cx="32" cy="34" r="16" style={shape("var(--butter)")} />
      <ellipse cx="32" cy="41" rx="7.5" ry="5.5" style={shape("var(--surface)")} />
      <circle cx="26" cy="31" r="2" style={{ fill: INK }} />
      <circle cx="38" cy="31" r="2" style={{ fill: INK }} />
      <path d="M29.5 37.5h5L32 40Z" style={shape(INK)} />
      <path d="M32 40v2.5M29 44.5c1.8 1.2 4.2 1.2 6 0" style={line} />
    </>
  ),
  cat: (
    <>
      <path
        d="M14 31 16 12l10 10q6-2 12 0l10-10 2 19q2 19-18 19T14 31Z"
        style={shape("var(--accent-soft)")}
      />
      <path d="m18.5 18 1 6M45.5 18l-1 6" style={line} />
      <ellipse cx="25" cy="33" rx="2" ry="3" style={{ fill: INK }} />
      <ellipse cx="39" cy="33" rx="2" ry="3" style={{ fill: INK }} />
      <path d="M30 39h4l-2 2Z" style={shape(INK)} />
      <path d="M32 41c0 2-2 3-4 3M32 41c0 2 2 3 4 3" style={line} />
      <path d="M9 37h11M9 43l11-2M55 37H44M55 43l-11-2" style={line} />
    </>
  ),
  bird: (
    <>
      <path d="M15 36 6 31l2 10Z" style={shape("var(--sky)")} />
      <ellipse cx="29" cy="38" rx="15" ry="11" style={shape("var(--sky)")} />
      <circle cx="43" cy="26" r="9" style={shape("var(--sky)")} />
      <path d="m51 24 8 3-8 3Z" style={shape("var(--butter)")} />
      <circle cx="45" cy="24" r="1.8" style={{ fill: INK }} />
      <path d="M21 36c4 6 11 6 15 0" style={line} />
      <path d="M26 49v7M33 49v7M24 56h4M31 56h4" style={line} />
    </>
  ),
  apple: (
    <>
      <path
        d="M32 21C24 14 12 18 12 32c0 13 10 23 20 21 10 2 20-8 20-21 0-14-12-18-20-11Z"
        style={shape("var(--rose)")}
      />
      <path d="M32 21c0-6 2-10 5-12" style={line} />
      <path d="M35 15c4-6 11-6 13-2-4 4-9 4-13 2Z" style={shape("var(--mint)")} />
      <path d="M19 31c0-4 2-7 5-8" style={line} />
    </>
  ),
  banana: (
    <>
      <path
        d="M15 18c-2 18 12 34 33 30 4-1 4-4 1-5-17 1-27-9-29-25 0-3-4-4-5 0Z"
        style={shape("var(--butter)")}
      />
      <path d="m15 18-3-5 5 1" style={line} />
      <path d="M21 27c3 9 11 15 22 17" style={line} />
      <path d="m48 48 2 2" style={line} />
    </>
  ),
  orange: (
    <>
      <circle cx="32" cy="37" r="18" style={shape("var(--math-surface)")} />
      <path d="M32 19v-5" style={line} />
      <path d="M32 17c2-6 8-8 12-6-2 5-8 7-12 6Z" style={shape("var(--mint)")} />
      <path d="M25 32h.01M39 40h.01M30 46h.01M41 31h.01M23 41h.01" style={{ ...line, strokeWidth: 2.5 }} />
    </>
  ),
};

export const PICTURE_ART_KEYS = Object.keys(ART);

export default function PictureArt({ name, size = 72, className }) {
  const art = ART[name];
  if (!art) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {art}
    </svg>
  );
}
