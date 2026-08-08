// منسوخ من jbrseo.com/app/actions/landing.ts — إدارة محتوى موقع جبر سيو من أدمن مودونتي.
// يحرّر نفس صفوف القاعدة التي يحرّرها أدمن جبر سيو (قاعدة واحدة، نماذج مرآة).
// ⚠️ مرآة: أي تغيير في شكل الحقول يُطبَّق هنا وفي jbrseo.com معاً.

"use server";

import { db } from "@/lib/db";
import type { SocialLinks } from "@/lib/jbr/landing-content.types";
import type { GlobalSiteSettings } from "@/lib/jbr/site-settings.types";
import { getLandingSectionOverride } from "@/lib/jbr/landing-sections";

export async function getGlobalSiteSettings(): Promise<GlobalSiteSettings | null> {
  const row = await db.jbrSiteSettings.findFirst();
  if (!row) return null;
  return {
    gtmId: row.gtmId ?? "",
    whatsappNumber: row.whatsappNumber ?? "",
  };
}

export async function getSocialLinksSettings(): Promise<SocialLinks> {
  const row = await getLandingSectionOverride("socialLinks");
  if (!row || typeof row !== "object" || Array.isArray(row)) return {};
  const raw = row as Record<string, unknown>;
  const val = (key: string): string | undefined => {
    const v = raw[key];
    if (typeof v !== "string") return undefined;
    const s = v.trim();
    return s || undefined;
  };
  return {
    facebook: val("facebook"),
    instagram: val("instagram"),
    linkedin: val("linkedin"),
    twitterX: val("twitterX"),
    youtube: val("youtube"),
    tiktok: val("tiktok"),
    snapchat: val("snapchat"),
  };
}

