import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { toInternationalPhone } from "@/lib/users/to-international-phone";
import { ALERT_CHANNELS, ALERT_TOPICS, PHONE_CHANNELS, type AlertChannelId, type AlertTopicId } from "@/lib/users/alert-topics";
import { readAlertPreferences } from "@/lib/users/read-alert-preferences";

export const alertsInput = z.object({
  marketingEmails: z.boolean(),
  /** Per topic, the channels chosen — an empty list turns the topic off. */
  topics: z.record(z.string(), z.array(z.string()).max(3)),
  /** Dial code without + («966») or «other» when the reader typed the full international number. */
  phoneDial: z.string().trim().max(8).optional().default("966"),
  phone: z.string().trim().max(30).optional().default(""),
});

/**
 * Saves the «التنبيهات» section for a known reader — the body of `updateAlertSettings` with the
 * identity passed in. The server is the gate: unknown topics and channels are dropped, and a phone
 * is required — and normalized to E.164 — only when WhatsApp or SMS is chosen. Every consent is
 * stamped with its date; a topic keeps its first date unless its channels change.
 */
export async function updateAlertSettingsAs(userId: string, raw: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = alertsInput.safeParse(raw);
    if (!parsed.success) return { success: false, error: "بيانات غير صالحة" };

    const user = await db.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true, phone: true } });
    if (!user) return { success: false, error: "Unauthorized" };

    const current = user.notificationPreferences && typeof user.notificationPreferences === "object"
      ? (user.notificationPreferences as Record<string, unknown>)
      : {};
    const before = readAlertPreferences(current);
    const now = new Date().toISOString();
    const knownTopics = new Set<string>(ALERT_TOPICS.map((t) => t.id));
    const knownChannels = new Set<string>(ALERT_CHANNELS.map((c) => c.id));

    const topics: Record<string, { channels: AlertChannelId[]; consentAt: string }> = {};
    for (const [id, list] of Object.entries(parsed.data.topics)) {
      if (!knownTopics.has(id)) continue;
      const channels = [...new Set(list.filter((c) => knownChannels.has(c)))] as AlertChannelId[];
      if (!channels.length) continue;
      const prev = before.topics[id as AlertTopicId];
      const same = prev && prev.channels.length === channels.length && channels.every((c) => prev.channels.includes(c));
      topics[id] = { channels, consentAt: same ? prev!.consentAt : now };
    }

    const needsPhone = Object.values(topics).some((t) => t.channels.some((c) => PHONE_CHANNELS.includes(c)));
    let phone = user.phone;
    if (parsed.data.phone) {
      // Any country, not Saudi/Egypt only (Khalid: «ممكن يكون اي جنسية») — stored as E.164, the form
      // WhatsApp's API takes.
      const international = toInternationalPhone(parsed.data.phoneDial, parsed.data.phone);
      if (!international) return { success: false, error: "رقم الجوال غير صحيح — اختر الدولة واكتب رقمك" };
      phone = international;
    }
    if (needsPhone && !phone) return { success: false, error: "اكتب رقم جوالك عشان توصلك رسائل واتساب" };

    const marketingEmails = parsed.data.marketingEmails;
    await db.user.update({
      where: { id: userId },
      data: {
        phone,
        notificationPreferences: {
          ...current,
          marketingEmails,
          marketingConsentAt: marketingEmails
            ? (before.marketingEmails ? (current.marketingConsentAt as string | null) ?? now : now)
            : null,
          topics,
        },
      },
    });

    revalidatePath("/users/profile/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating alert settings:", error);
    return { success: false, error: "تعذّر الحفظ، حاول مرة ثانية" };
  }
}
