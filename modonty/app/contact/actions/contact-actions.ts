"use server";

import { db } from "@/lib/db";
import { getOrCreateSessionId, createConversion } from "@/lib/conversion-tracking";
import { ConversionType } from "@prisma/client";
import { notifyTelegram } from "@/lib/telegram/notify";

interface ContactMessageData {
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

export async function submitContactMessage(data: ContactMessageData) {
  try {
    const resolvedClientId = data.clientId?.trim() || null;
    if (resolvedClientId) {
      const client = await db.client.findUnique({
        where: { id: resolvedClientId },
        select: { id: true },
      });
      if (!client) {
        return { success: false, error: "العميل غير موجود" };
      }
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

    const sessionId = await getOrCreateSessionId();
    await createConversion({
      type: ConversionType.CONTACT_FORM,
      sessionId,
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
      }).catch(() => {});
    }

    return { success: true, message: "تم إرسال الرسالة بنجاح" };
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return { success: false, error: "فشل إرسال الرسالة" };
  }
}
