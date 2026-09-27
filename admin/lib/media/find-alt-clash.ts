"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  clientId: z.string().min(1),
  altText: z.string().trim().max(300),
  /** The file being replaced — it goes once the new one is linked, so it is not a clash. */
  ignoreId: z.string().min(1).optional(),
});

/**
 * Another file of the same client already carrying this alt text, or null.
 *
 * The SAME test SEO Images runs before it saves (save-image-seo.ts: client-scoped,
 * case-insensitive, trimmed). The upload window asks first, so a duplicate is caught while the
 * writer is still typing — not later, when SEO Images refuses the edit and the duplicate is
 * already baked into the file name (the name derives from the alt).
 */
export async function findAltClash(input: z.input<typeof schema>): Promise<{ filename: string } | null> {
  const session = await auth();
  if (!session) return null;

  const parsed = schema.safeParse(input);
  if (!parsed.success || !parsed.data.altText) return null;
  const { clientId, altText, ignoreId } = parsed.data;

  return db.media.findFirst({
    where: {
      clientId,
      altText: { equals: altText, mode: "insensitive" },
      ...(ignoreId ? { id: { not: ignoreId } } : {}),
    },
    select: { filename: true },
  });
}
