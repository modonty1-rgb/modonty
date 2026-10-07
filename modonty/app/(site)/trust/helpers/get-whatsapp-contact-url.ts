"use cache";

import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

/**
 * WhatsApp CHAT link for "تواصل" CTAs — built from the admin-set contact phone
 * (Settings.orgContactTelephone, the رقم الجوال in admin → settings). Digits are extracted
 * so the stored format (+966…, spaces) still yields a valid wa.me link.
 * Falls back to the explicit WhatsApp channel link, then null (caller shows the contact form).
 * Cached + tagged "settings" → invalidated on admin save.
 */
export async function getWhatsappContactUrl(): Promise<string | null> {
  cacheTag("settings");
  cacheLife("hours");

  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { orgContactTelephone: true, whatsappChannelUrl: true },
  });

  const digits = settings?.orgContactTelephone?.replace(/\D/g, "") ?? "";
  if (digits) return `https://wa.me/${digits}`;

  return settings?.whatsappChannelUrl?.trim() || null;
}
