import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  if (!text) return "";

  return text
    .toString()
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Slugify then truncate at a word (dash) boundary — keeps slug under maxChars.
export function slugifyShort(text: string, maxChars = 50): string {
  const full = slugify(text);
  if (full.length <= maxChars) return full;
  const truncated = full.slice(0, maxChars);
  const lastDash = truncated.lastIndexOf("-");
  return lastDash > 0 ? truncated.slice(0, lastDash) : truncated;
}
