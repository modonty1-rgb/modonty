import { toArabicDigits } from "@/lib/audio/to-arabic-digits";

/** `2:06:15`, not `126:15` — the hour slot appears only when there is one. */
export function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "٠٠:٠٠";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return toArabicDigits(h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
}
