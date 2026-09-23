import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/lib/db";
import { getPlatformSocialLinks, type SocialLink } from "@/lib/settings/get-platform-social-links";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { getWhatsAppLink } from "@/lib/whatsapp";

export type AccountsData = {
  socials: SocialLink[];
  /** wa.me link to the sales desk, or null when no sales phone is set in the admin. */
  salesWhatsapp: string | null;
  /** The organisation's public contact email (Settings → Business → Contact), or null. */
  contactEmail: string | null;
};

/**
 * Everything on /accounts comes from the admin Settings row — the same fields the footer,
 * the author page and the payment app read. Editing a link in the admin updates this page;
 * an empty field simply is not drawn. No second list of our accounts exists anywhere.
 */
export async function getAccountsData(): Promise<AccountsData> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const [socials, settings] = await Promise.all([
    getPlatformSocialLinks(),
    db.settings.findUnique({ where: SETTINGS_SINGLETON_WHERE, select: { salesPhone: true, orgContactEmail: true } }),
  ]);

  const phone = settings?.salesPhone?.trim();
  return {
    socials,
    salesWhatsapp: phone ? getWhatsAppLink(phone, "السلام عليكم، وصلت لكم من صفحة حسابات مدونتي") : null,
    contactEmail: settings?.orgContactEmail?.trim() || null,
  };
}
