"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { revalidatePartner } from "@/lib/revalidate-partner";
import { mySiteInputSchema, type MySiteInput } from "../helpers/my-site-schema";

type Result = { success: true; live: boolean } | { success: false; error: string };

/**
 * Save the partner's look: header · footer · colour · subdomain — one upsert on his
 * ClientSite row. Publishes immediately (decision ١). SEO is untouched by design, so
 * only modonty's page cache is busted (best-effort, like every other console save).
 */
export async function saveMySite(input: MySiteInput): Promise<Result> {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const parsed = mySiteInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "القيم غير صحيحة" };
  const { headerTemplate, footerTemplate, primaryColor, subdomain } = parsed.data;
  // `subdomain` غائب = لا يُكتب أصلاً؛ كتابته `null` على مونجو تصطدم بصفٍّ آخر بلا نطاق.
  const look = { headerTemplate, footerTemplate, primaryColor };
  const address = subdomain === undefined ? {} : { subdomain };

  try {
    await db.clientSite.upsert({
      where: { clientId },
      create: { clientId, ...look, ...address },
      update: { ...look, ...address },
    });
  } catch (e) {
    // P2002 on `subdomain`: someone else already owns that label.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, error: "هذا الاسم مستخدم — جرّب غيره" };
    }
    return { success: false, error: messages.error.serverError };
  }

  // Immediate, and reported: the builder said «ظاهر على موقعك» while modonty could still serve
  // the old page once, and a failed bust was swallowed (4 Oct 2026).
  // This partner's pages only (4 Oct 2026) — the look never appears in the shared listings.
  const owner = await db.client.findUnique({ where: { id: clientId }, select: { slug: true } });
  const live = owner ? await revalidatePartner({ id: clientId, slug: owner.slug }) : false;
  revalidatePath("/dashboard/my-site");
  return { success: true, live };
}
