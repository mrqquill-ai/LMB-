/**
 * The CTA arrow.
 *
 * This was U+2197 NORTH EAST ARROW, but neither IBM Plex Sans nor Big Shoulders
 * Display carries a glyph for it. Desktop fell back to a system face and drew a
 * plain arrow; iOS fell through to Apple Color Emoji and drew a blue tile. Same
 * character, different fallback, so the CTA looked like a different button on a
 * phone than on a laptop.
 *
 * Drawn here instead: one diagonal and a head, in the same square-capped stroke
 * language as the rest of the site, inheriting the label's colour and scaling
 * with its size.
 */
export function Arrow() {
  return (
    <svg
      className="lmb-arrow"
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d="M3.4 8.6 8.6 3.4" />
      <path d="M4.9 3.4H8.6V7.1" />
    </svg>
  );
}
