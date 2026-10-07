import "server-only";

import { ConversionType } from "@prisma/client";

import { db } from "@/lib/db";
import { createConversion } from "@/lib/analytics/conversion-tracking";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackContactSubmit } from "@/lib/analytics/events-registry";

export interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string | null;
  clientId?: string | null;
  userId?: string | null;
}

/**
 * Store one support message — the body of `submitContactMessage` with the conversion's session
 * passed in (web: the visit cookie · app: the device). ContactMessage row · CONTACT_FORM
 * conversion · partner Telegram when addressed to a partner · GA4. `userId` must come from a
 * verified identity (session or Bearer), never from a request body.
 */
export async function saveContactMessage(data: ContactMessageData, resolveSessionId: () => Promise<string>) {
  try {
    const resolvedClientId = data.clientId?.trim() || null;
    let clientContext: { slug?: string; name?: string } = {};
    if (resolvedClientId) {
      const client = await db.client.findUnique({
        where: { id: resolvedClientId },
        select: { id: true, slug: true, name: true },
      });
      if (!client) {
        return { success: false, error: "العميل غير موجود" };
      }
      clientContext = { slug: client.slug, name: client.name };
    }

    const resolvedUserId = data.userId?.trim() || null;
    if (resolvedUserId) {
      const user = await db.user.findUnique({
        where: { id: resolvedUserId },
        select: { id: true },
      });
      if (!user) {
        return { success: false, error: "المستخدم غير موجود" };
      }
    }

    await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: "new",
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referrer: data.referrer,
        ...(resolvedClientId && { clientId: resolvedClientId }),
        ...(resolvedUserId && { userId: resolvedUserId }),
      },
    });

    await createConversion({
      type: ConversionType.CONTACT_FORM,
      sessionId: await resolveSessionId(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer,
    });

    if (resolvedClientId) {
      notifyTelegram(resolvedClientId, "supportMessage", {
        title: data.subject,
        body: `${data.name}: ${data.message}`,
        meta: { "البريد": data.email },
        link: {
          label: "الرد من اللوحة",
          url: "https://console.modonty.com/dashboard/support",
        },
        ipAddress: data.ipAddress ?? null,
      }).catch((e: unknown) => console.error("[saveContactMessage] telegram", e));
    }

    void trackContactSubmit(
      {
        client_id: resolvedClientId ?? undefined,
        client_slug: clientContext.slug,
        client_name: clientContext.name,
        contact_method: "form",
      },
      { userId: resolvedUserId ?? undefined },
    );

    return { success: true, message: "تم إرسال الرسالة بنجاح" };
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return { success: false, error: "فشل إرسال الرسالة" };
  }
}
