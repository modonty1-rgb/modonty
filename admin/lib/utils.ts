import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
