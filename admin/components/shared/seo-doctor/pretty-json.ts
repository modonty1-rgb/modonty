export function prettyJson(value: unknown): string | null {
  if (value == null) return null;
  try {
    if (typeof value === "string") return JSON.stringify(JSON.parse(value), null, 2);
    return JSON.stringify(value, null, 2);
  } catch {
    return typeof value === "string" ? value : null;
  }
}
