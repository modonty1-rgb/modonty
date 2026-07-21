"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { generateClientSEO } from "@/app/(dashboard)/clients/actions/clients-actions/generate-client-seo";

/**
 * NARROW save for the writer-owned "SEO Images" section: only the fields the content
 * writer edits on an image (alt text · description · optional title override). After the
 * partial media update it regenerates the SEO of every CLIENT whose JSON-LD embeds this
 * image (logo / hero / gallery) — closing the image→client gap (step 17).
 */
const schema = z.object({
  mediaId: z.string().min(1),
  altText: z.string().trim().max(300).nullable().optional(),
  description: z.string().trim().max(600).nullable().optional(),
  title: z.string().trim().max(200).nullable().optional(),
});

export type SaveImageSeoInput = z.infer<typeof schema>;

export async function saveImageSeo(
  input: SaveImageSeoInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { mediaId, altText, description, title } = parsed.data;

  let affectedClientIds: string[] = [];
  try {
    const media = await db.media.update({
      where: { id: mediaId },
      data: {
        altText: altText?.trim() || null,
        description: description?.trim() || null,
        title: title?.trim() || null,
      },
      select: {
        type: true,
        clientId: true,
        logoClients: { select: { id: true } },
        heroImageClients: { select: { id: true } },
      },
    });
    const ids = new Set<string>();
    media.logoClients.forEach((c) => ids.add(c.id));
    media.heroImageClients.forEach((c) => ids.add(c.id));
    // A GALLERY image is owned by its client and rendered in that client's image[].
    if (media.type === "GALLERY" && media.clientId) ids.add(media.clientId);
    affectedClientIds = [...ids];
  } catch {
    return { success: false, error: "تعذّر حفظ بيانات الصورة — حاول مرة أخرى." };
  }

  // Regenerate each owning client so the new alt/description reaches its stored JSON-LD.
  for (const cid of affectedClientIds) {
    await generateClientSEO(cid).catch(() => null);
  }

  revalidatePath("/seo-images");
  if (affectedClientIds.length > 0) await revalidateModontyTag("clients");

  return { success: true };
}
