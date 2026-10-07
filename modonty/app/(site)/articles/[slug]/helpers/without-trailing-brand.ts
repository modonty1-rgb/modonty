import type { Metadata } from "next";

/**
 * The stored title ends with « - {client}» (admin metadata-generator.ts), and the root layout's
 * template appends « | {brand}». When the client IS the brand, Google got «… - مدونتي | مدونتي»
 * — 47 articles in the 2 Oct 2026 study (plan item ب٢). Dropping the client suffix when it is
 * the brand leaves exactly one, from the template.
 */
export function withoutTrailingBrand(title: Metadata["title"], brand: string | undefined): Metadata["title"] {
  if (typeof title !== "string" || !brand) return title;
  for (const suffix of [` - ${brand}`, ` | ${brand}`]) {
    if (title.endsWith(suffix)) return title.slice(0, -suffix.length);
  }
  return title;
}
