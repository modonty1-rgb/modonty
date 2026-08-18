/**
 * `#1D4ED8` → `"224 76% 48%"` — the space-separated HSL triplet Tailwind's
 * `hsl(var(--primary))` expects. `lightenBy` bumps lightness (0–100) for dark mode,
 * where the palette's mid-tones read too dim as text (see partner-site-palette.ts).
 * Returns null for anything that is not a 6-digit hex, so a bad stored value can never
 * emit broken CSS.
 */
export function hexToHslTriplet(hex: string, lightenBy = 0): string | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const lPct = Math.min(100, Math.round(l * 100) + lightenBy);
  return `${h} ${Math.round(s * 100)}% ${lPct}%`;
}
