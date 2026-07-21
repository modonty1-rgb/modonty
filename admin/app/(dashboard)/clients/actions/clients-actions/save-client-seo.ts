"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { generateClientSEO } from "./generate-client-seo";

/**
 * NARROW save for the writer-owned "SEO Client" section: only the two fields the
 * content writer edits (SEO title + description). It writes JUST those columns
 * (partial update — never the whole client object, so unrelated fields can't be
 * wiped, R2), then regenerates the full JSON-LD + metaTags through the SHARED
 * bundle (generateClientSEO) and revalidates the public client surfaces.
 */

const saveClientSeoSchema = z.object({
  clientId: z.string().min(1),
  seoTitle: z.string().trim().max(120).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
});

export type SaveClientSeoInput = z.infer<typeof saveClientSeoSchema>;

export async function saveClientSeo(
  input: SaveClientSeoInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = saveClientSeoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { clientId, seoTitle, seoDescription } = parsed.data;

  try {
    // Partial update — only the two writer-owned fields.
    await db.client.update({
      where: { id: clientId },
      data: {
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
      },
    });
  } catch {
    return { success: false, error: "تعذّر حفظ بيانات السيو — حاول مرة أخرى." };
  }

  // Regenerate JSON-LD + metaTags from DB through the shared bundle (single path).
  const gen = await generateClientSEO(clientId);
  if (!gen.success) {
    return { success: false, error: gen.error ?? "تعذّر إعادة توليد السيو." };
  }

  revalidatePath("/clients/seo");
  revalidatePath("/clients");
  await revalidateModontyTag("clients");

  return { success: true };
}
