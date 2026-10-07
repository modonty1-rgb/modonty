/** Parse language string to BCP 47 format: single string or array for multiple. */
export function parseLanguageCodes(raw: string | null | undefined, fallback = "ar"): string | string[] {
  const val = (raw ?? fallback).trim();
  if (!val) return fallback;
  const parts = val
    .split(",")
    .map((p) => (p.trim().split("_")[0] || p.trim()).trim())
    .filter(Boolean);
  const codes = [...new Set(parts)];
  if (codes.length === 0) return fallback;
  if (codes.length === 1) return codes[0];
  return codes;
}
