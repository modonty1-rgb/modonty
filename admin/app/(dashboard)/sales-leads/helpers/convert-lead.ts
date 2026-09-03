import "server-only";
import { db } from "@/lib/db";

/**
 * A URL-safe slug from an Arabic name.
 *
 * Arabic letters are kept as-is — `clients.slug` already holds Arabic slugs in production
 * (`عيادات-سمايل-تاون-لطب-الفم-و-الأسنان`), and transliterating would produce an address
 * nobody recognises next to the ones that are already live.
 */
export function slugifyName(name: string): string {
  return name
    .trim()
    .replace(/[.،,؛;:!؟?"'()[\]{}]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

/**
 * The suggestion the dialog opens with — already checked against what exists, so the common
 * case is one click. A taken slug gets a numeric suffix rather than an error the person has
 * to solve themselves.
 */
export async function suggestSlug(name: string): Promise<string> {
  const base = slugifyName(name) || "client";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await db.client.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return `${base}-${Date.now().toString().slice(-5)}`;
}
