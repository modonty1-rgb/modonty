"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NotificationPriority, StaffRole } from "@prisma/client";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendContentTeamTelegram, escapeTgHtml } from "@modonty/shared/lib/telegram/client";

// The operations manager's note about a client, pushed to the content team's Telegram
// group and kept as a record here.
//
// The row is the source of truth, the Telegram message is only its delivery — so the
// delivery result is written down. A history that claims "sent" while the bot was
// misconfigured would be trusted by somebody, and that is worse than an empty history.

const MAX_MESSAGE = 1000;

const PRIORITY_TAG: Record<NotificationPriority, string> = {
  NORMAL: "🟢 عادي",
  IMPORTANT: "🟡 مهم",
  URGENT: "🔴 عاجل",
};

/**
 * Where the team should land when they tap the link.
 *
 * NOT the request host. In development that host is `localhost:3000`, and the first three
 * notes this feature ever sent reached eleven real people carrying a link only the machine
 * that sent it could open. The brief lives at one public address; use it.
 */
const ADMIN_ORIGIN = "https://admin.modonty.com";

type Result =
  | { success: true; delivered: boolean; error?: string }
  | { success: false; error: string };

export async function notifyContentTeam(
  clientId: string,
  message: string,
  priority: NotificationPriority,
  recipientIds: string[],
): Promise<Result> {
  const session = await auth();
  const staffId = session?.user?.id;
  if (!staffId) return { success: false, error: "غير مصرّح" };

  const text = (message ?? "").trim();
  if (!text) return { success: false, error: "اكتب النص قبل الإرسال" };
  if (!Object.values(NotificationPriority).includes(priority)) {
    return { success: false, error: "درجة أهمية غير معروفة" };
  }

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true },
  });
  if (!client) return { success: false, error: "العميل غير موجود" };

  // Resolve the picked ids against the SAME role filter the picker uses. The browser sends
  // ids; without re-checking them here, anyone could address a note to a sales rep — or to
  // an id that is not staff at all — and the history would record it as fact.
  const ids = [...new Set((recipientIds ?? []).filter((id) => /^[a-f\d]{24}$/i.test(id)))];
  const recipients = ids.length
    ? await db.staff.findMany({
        where: {
          id: { in: ids },
          role: { in: [StaffRole.EDITOR, StaffRole.CREATIVE] },
          NOT: { isActive: false },
        },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      })
    : [];

  if (ids.length > 0 && recipients.length === 0) {
    return { success: false, error: "المستلمون المختارون غير صالحين" };
  }

  const recipientNames = recipients.map((r) => r.name?.trim() || r.email || "بلا اسم");
  // Empty selection is a deliberate choice, not a missing one: it addresses the group.
  const toLine = recipientNames.length > 0 ? recipientNames.join(" · ") : "الكل";

  // Snapshot of the sender, read from the session — never from the caller.
  const sentByName = session.user?.name?.trim() || "—";
  const sentByEmail = session.user?.email ?? "";

  // Kept only to notice, in the logs, when a preview deploy sends from an unexpected host.
  const h = await headers();
  const requestHost = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const briefLink = `${ADMIN_ORIGIN}/briefs/${client.id}`;
  if (requestHost && !requestHost.includes("admin.modonty.com")) {
    console.info(`[notify] sent from ${requestHost}; link points at ${ADMIN_ORIGIN}`);
  }

  const body = text.slice(0, MAX_MESSAGE);

  // Labelled lines, in the order Khalid asked for: sender, recipient, client, the note,
  // then priority. Formatting per the official HTML list
  // (core.telegram.org/bots/api#html-style) — verified live against this group, which
  // echoed back `blockquote` and `expandable_blockquote` among the parsed entities.
  //
  // The note sits in a blockquote so the instruction is visually separate from the four
  // label lines around it. Long notes use the expandable variant, which Telegram collapses
  // to a couple of lines — a 1000-character note otherwise buries every message above it.
  const isLong = body.length > 220 || body.split("\n").length > 3;
  const quote = `<blockquote${isLong ? " expandable" : ""}>${escapeTgHtml(body)}</blockquote>`;

  const tg =
    `<b>مرسل:</b> ${escapeTgHtml(sentByName)}\n` +
    `<b>مستلم:</b> ${escapeTgHtml(toLine)}\n` +
    `<b>اسم العميل:</b> ${escapeTgHtml(client.name)}\n` +
    `${quote}` +
    `<b>درجة الأهمية:</b> ${PRIORITY_TAG[priority]}\n` +
    `<a href="${escapeTgHtml(briefLink)}">افتح البرِيف</a>`;

  const sent = await sendContentTeamTelegram(tg);

  try {
    await db.clientNotification.create({
      data: {
        clientId: client.id,
        message: body,
        priority,
        recipientIds: recipients.map((r) => r.id),
        recipientNames,
        sentById: staffId,
        sentByName,
        sentByEmail,
        // Recorded either way — a failed send is exactly the row somebody needs to see.
        delivered: sent.success,
        error: sent.success ? null : (sent.error ?? "فشل غير معروف").slice(0, 500),
      },
    });
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل حفظ السجل" };
  }

  revalidatePath(`/briefs/${client.id}`);
  return { success: true, delivered: sent.success, error: sent.success ? undefined : sent.error };
}
