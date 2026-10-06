"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { revalidatePartner } from "@/lib/revalidate-partner";

// «page:block» — e.g. «home:testimonials». Bare keys were shared by every page (4 Oct 2026).
const KEY = /^[a-z]{2,12}:[a-z][a-z-]{1,30}$/;
const schema = z.array(z.string().regex(KEY)).max(60).transform((keys) => Array.from(new Set(keys)));

type Result = { success: true } | { success: false; error: string };

/**
 * Persist which blocks the partner switched OFF, each as «page:block». The old comment said the
 * keys were namespaced by the registries — they were not, and «faq» or «cta» hidden on one page
 * vanished from every page that has a block of that name. One field on his ClientSite row.
 */
export async function saveHiddenBlocks(hiddenSections: string[]): Promise<Result> {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const parsed = schema.safeParse(hiddenSections);
  if (!parsed.success) return { success: false, error: "القيم غير صحيحة" };

  try {
    await db.clientSite.upsert({
      where: { clientId },
      create: { clientId, hiddenSections: parsed.data },
      update: { hiddenSections: parsed.data },
    });
  } catch {
    return { success: false, error: messages.error.serverError };
  }
  // This partner's pages only (4 Oct 2026). Best-effort: the row is saved either way.
  const owner = await db.client.findUnique({ where: { id: clientId }, select: { slug: true } });
  if (owner) await revalidatePartner({ id: clientId, slug: owner.slug });
  // Both screens that own this field: the per-page settings and the «موقعي» builder.
  revalidatePath("/dashboard/site-pages", "layout");
  revalidatePath("/dashboard/my-site");
  return { success: true };
}
