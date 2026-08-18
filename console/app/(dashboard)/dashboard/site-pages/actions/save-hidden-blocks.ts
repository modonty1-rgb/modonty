"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

const KEY = /^[a-z][a-z-]{1,30}$/;
const schema = z.array(z.string().regex(KEY)).max(60).transform((keys) => Array.from(new Set(keys)));

type Result = { success: true } | { success: false; error: string };

/**
 * Persist which blocks the partner switched OFF (any page — the keys are namespaced by
 * the block registries). One field on his ClientSite row; upsert so a first save works.
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
  try {
    await revalidateModontyTag("clients");
  } catch {
    /* best-effort */
  }
  revalidatePath("/dashboard/site-pages", "layout");
  return { success: true };
}
