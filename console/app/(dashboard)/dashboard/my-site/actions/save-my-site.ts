"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { mySiteInputSchema, type MySiteInput } from "../helpers/my-site-schema";

type Result = { success: true } | { success: false; error: string };

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

  try {
    await db.clientSite.upsert({
      where: { clientId },
      create: { clientId, headerTemplate, footerTemplate, primaryColor, subdomain },
      update: { headerTemplate, footerTemplate, primaryColor, subdomain },
    });
  } catch (e) {
    // P2002 on `subdomain`: someone else already owns that label.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, error: "هذا الاسم مستخدم — جرّب غيره" };
    }
    return { success: false, error: messages.error.serverError };
  }

  try {
    await revalidateModontyTag("clients");
  } catch {
    /* best-effort */
  }
  revalidatePath("/dashboard/my-site");
  return { success: true };
}
