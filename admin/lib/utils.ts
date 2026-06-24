import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Human-readable byte size, e.g. 1234567 → "1.2 MB". */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const val = bytes / Math.pow(1024, i);
  return `${val >= 100 || i === 0 ? Math.round(val) : val.toFixed(1)} ${units[i]}`;
}

export function slugify(text: string): string {
  if (!text) return "";

  return text
    .toString()
    // NFKC folds Arabic presentation-forms (e.g. ﻣﺼﻨﻊ → مصنع) + ligatures to their
    // canonical base letters so slugs use normal code points (searchable, clean).
    // Normal text is left unchanged. Verified: MDN String.normalize + Unicode UAX#15.
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    // Spaces → dash
    .replace(/\s+/g, "-")
    // Keep ONLY letters/numbers (any script — Latin, Arabic, etc.) and dashes.
    // Using \p{L}\p{N} excludes punctuation like Arabic ؟ (U+061F), ، (U+060C), ؛ (U+061B)
    // even though those code points sit inside the Arabic block.
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
