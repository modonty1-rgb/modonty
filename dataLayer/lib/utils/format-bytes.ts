/**
 * formatBytes — human-readable byte size.
 * Pure + client-safe (no deps, no server-only).
 * e.g. 1234567 → "1.2 MB". Empty/zero → "—".
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const val = bytes / Math.pow(1024, i);
  return `${val >= 100 || i === 0 ? Math.round(val) : val.toFixed(1)} ${units[i]}`;
}
