/**
 * The one packer behind every image grid in admin · console · modonty.
 *
 * Standard approved by Khalid 2026-08-07 after a side-by-side comparison of four layouts
 * on real production images — see `.claude/skills/gallery-justified-rows/SKILL.md` and
 * `documents/tasks/media-picker-layout-compare.html`.
 *
 * ── What it does ────────────────────────────────────────────────────────────────────
 * Packs tiles into rows whose computed height makes each row fill the container width
 * exactly, at every image's true aspect ratio. Zero cropping, zero gaps, reading order
 * ("newest first") preserved.
 *
 * ── Why the container width does NOT have to be measured ────────────────────────────
 * Widths come back as PERCENTAGES. So `containerWidth` only decides how many tiles land
 * in a row — never whether the row fills its parent. A sensible constant is enough, and
 * the layout stays justified through any resize. Hence: no ResizeObserver, no useEffect,
 * no DOM read, no post-hydration reflow.
 *
 * ── Why the measured library forced this ────────────────────────────────────────────
 * Production media on 2026-08-07 (220 rows): 165 landscape · 39 portrait · 10 square ·
 * 6 at 6:1 (client covers, 2400×400). A square box crops the majority, and loses 83% of
 * a 6:1 cover. Masonry was rejected for reading column-by-column; natural-ratio-in-grid
 * for leaving gaps under the shorter image in a row.
 */

export interface Tile {
  width?: number | null;
  height?: number | null;
}

export interface JustifiedItem<T> {
  tile: T;
  /**
   * `flex-grow` for the tile. Pair it with `flex-basis: 0` inside a `display:flex` row
   * and the browser distributes the space left after the gaps in proportion to each
   * ratio — so widths sum to exactly the row width and every tile ends up the same
   * height. Percentage widths were tried first and overflowed by ~0.2%: they cannot know
   * the pixel gaps at the real container width. This can.
   */
  grow: number;
  /** Percentage of the packing width. Kept for callers that cannot use flex. */
  widthPct: number;
}

export interface JustifiedRow<T> {
  items: Array<JustifiedItem<T>>;
  /** Row height in px at the packing width. Use it only for the target-height fallback. */
  height: number;
  isLast: boolean;
}

/** A single 10:1 banner would otherwise swallow a whole row, so ratios are clamped. */
const MIN_RATIO = 0.4;
const MAX_RATIO = 4;
/** Rows with no stored dimensions fall back to 4:3 — never dropped from the grid (IMGDIM). */
const FALLBACK_RATIO = 4 / 3;

function ratioOf(t: Tile): number {
  const raw = t.width && t.height && t.width > 0 && t.height > 0 ? t.width / t.height : FALLBACK_RATIO;
  return Math.min(Math.max(raw, MIN_RATIO), MAX_RATIO);
}

export function justifyRows<T extends Tile>(
  tiles: T[],
  containerWidth: number,
  targetHeight = 190,
  gap = 12,
): Array<JustifiedRow<T>> {
  if (!tiles.length || containerWidth <= 0) return [];

  const packed: T[][] = [];
  let row: T[] = [];
  let sum = 0;

  for (const t of tiles) {
    row.push(t);
    sum += ratioOf(t);
    if (sum * targetHeight + gap * (row.length - 1) >= containerWidth) {
      packed.push(row);
      row = [];
      sum = 0;
    }
  }
  if (row.length) packed.push(row);

  return packed.map((items, i) => {
    const isLast = i === packed.length - 1;
    const sumR = items.reduce((a, t) => a + ratioOf(t), 0);
    const avail = containerWidth - gap * (items.length - 1);
    // The last row keeps the target height rather than stretching one image across the
    // full width — a lone trailing image blown up to 900px reads as a bug, not a layout.
    const underfilled = sumR * targetHeight + gap * (items.length - 1) < containerWidth;
    const h = isLast && underfilled ? targetHeight : avail / sumR;
    return {
      height: h,
      isLast,
      items: items.map((tile) => ({
        tile,
        grow: ratioOf(tile),
        widthPct: ((h * ratioOf(tile)) / containerWidth) * 100,
      })),
    };
  });
}

/** Aspect ratio for the tile's own box, clamped the same way the packer clamps it. */
export function tileAspectRatio(t: Tile): string {
  return String(ratioOf(t));
}

/**
 * True when the tile's real ratio falls outside the clamp, so its box is NOT its own
 * shape and `object-cover` would cut it. Callers must switch to `object-contain` for
 * these — otherwise a 6:1 client cover (2400×400) loses a third of itself inside a 4:1
 * box, which is exactly the cropping this standard exists to remove.
 *
 * Clamping the PACKING is still right — one 10:1 banner would swallow a whole row — but
 * clamping the packing must not mean cropping the picture.
 */
export function isTileClamped(t: Tile): boolean {
  if (!t.width || !t.height || t.width <= 0 || t.height <= 0) return false;
  const raw = t.width / t.height;
  return raw < MIN_RATIO || raw > MAX_RATIO;
}

/**
 * `object-contain` cases: the box is NOT the picture's own shape, so covering would cut.
 *
 * Two of them, and the second was found by measuring rather than by reasoning — a live
 * count on 2026-08-08 showed 11 tiles still visibly cropped after the clamp fix, every
 * one of them a row with NO stored dimensions: the 4:3 fallback box against a real 1.9
 * or 4.1 picture. Falling back on the ratio is right (the tile must still render); using
 * that guess to CROP is not, because the guess is known to be wrong.
 *
 * Once `IMGDIM` fills the missing dimensions these tiles switch to cover on their own.
 */
export function shouldContainTile(t: Tile): boolean {
  const hasDims = !!(t.width && t.height && t.width > 0 && t.height > 0);
  return !hasDims || isTileClamped(t);
}
