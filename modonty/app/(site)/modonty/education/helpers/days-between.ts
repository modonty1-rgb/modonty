const DAY_MS = 86_400_000;

/** Whole days from one `YYYY-MM-DD` to another, both read as UTC midnights. */
export const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
