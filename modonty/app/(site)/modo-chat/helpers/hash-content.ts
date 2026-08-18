import { createHash } from "node:crypto";

/** Short, stable fingerprint of an article body — the key that invalidates cached chunks. */
export function hashContent(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 32);
}
