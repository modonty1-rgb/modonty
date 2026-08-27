"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { logAction } from "@/lib/audit/log-action";
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

  // Read the two columns BEFORE overwriting them. There is no transaction to roll back
  // into here: the regeneration below is a separate call that reads the row after the
  // write, so it cannot sit inside one. What the previous values buy is compensation —
  // see the restore after the generator.
  const before = await db.client.findUnique({
    where: { id: clientId },
    select: { seoTitle: true, seoDescription: true },
  });
  if (!before) return { success: false, error: "الشريك غير موجود." };

  let clientName: string | null = null;
  try {
    // Partial update — only the two writer-owned fields.
    const updated = await db.client.update({
      where: { id: clientId },
      data: {
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
      },
      select: { name: true },
    });
    clientName = updated.name;
  } catch {
    return { success: false, error: "تعذّر حفظ بيانات السيو — حاول مرة أخرى." };
  }

  await logAction("client.seo", {
    entity: "Client",
    entityId: clientId,
    summary: clientName ?? clientId,
  });

  // Regenerate JSON-LD + metaTags from DB through the shared bundle (single path).
  const gen = await generateClientSEO(clientId);
  if (!gen.success) {
    // Compensate. The two columns are already written; the stored card is not. Leaving it
    // there means the row says one title and its published card says another — and the next
    // unrelated cache flush ships that mismatch to Google. The screen says "failed", so the
    // database must say "unchanged": put the previous values back.
    try {
      await db.client.update({
        where: { id: clientId },
        data: { seoTitle: before.seoTitle, seoDescription: before.seoDescription },
      });
    } catch {
      // The restore itself failed — the row IS now inconsistent, and hiding that behind the
      // generator's message would send the writer away thinking nothing was saved.
      return {
        success: false,
        error: "انحفظ العنوان والوصف لكن ما انبنى السيو، والرجوع للقيم القديمة فشل — افتح الشريك وتأكّد من الحقلين.",
      };
    }
    return { success: false, error: gen.error ?? "تعذّر إعادة توليد السيو." };
  }

  revalidatePath("/clients/seo");
  revalidatePath("/clients");
  await revalidateModontyTag("clients");

  return { success: true };
}
