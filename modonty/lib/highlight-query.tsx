import type { ReactNode } from "react";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Splits text by query (case-insensitive) and returns segments with matches wrapped in <mark>.
 * Uses substrings from the original text only to avoid XSS.
 */
export function highlightQuery(text: string, query: string): ReactNode[] {
  const trimmed = query.trim();
  if (!trimmed || !text) return [text];

  const escaped = escapeRegex(trimmed);
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-primary/20 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
