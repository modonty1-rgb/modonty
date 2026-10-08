import "server-only";

import { SharePlatform } from "@prisma/client";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackClientShare } from "@/lib/analytics/events-registry";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

const PLATFORM_MAP: Record<string, SharePlatform> = {
  TWITTER: SharePlatform.TWITTER,
  LINKEDIN: SharePlatform.LINKEDIN,
  FACEBOOK: SharePlatform.FACEBOOK,
  WHATSAPP: SharePlatform.WHATSAPP,
  EMAIL: SharePlatform.EMAIL,
  COPY_LINK: SharePlatform.COPY_LINK,
  OTHER: SharePlatform.OTHER,
};

// Arabic labels for the Telegram notification (enum values are English).
const SHARE_PLATFORM_AR: Record<SharePlatform, string> = {
  [SharePlatform.TWITTER]: "إكس (تويتر)",
  [SharePlatform.LINKEDIN]: "لينكدإن",
  [SharePlatform.FACEBOOK]: "فيسبوك",
  [SharePlatform.WHATSAPP]: "واتساب",
  [SharePlatform.EMAIL]: "البريد",
  [SharePlatform.COPY_LINK]: "نسخ الرابط",
  [SharePlatform.PRINT]: "طباعة",
  [SharePlatform.OTHER]: "أخرى",
};

export type ClientShareResult = "not_found" | "tracked";

/**
 * One partner-page share — the body of `POST /clients/[slug]/api/share`, shared by the web route
 * (keyed on the `modonty_view_sid` cookie) and the mobile API (keyed on X-Device-Id). The web has
 * no rate limit on this one; neither does the app.
 */
export async function recordClientShare(input: {
  slug: string;
  platform: string;
  sessionId: string;
  resolveUserId: () => Promise<string | undefined>;
  headers: Headers;
}): Promise<ClientShareResult> {
  const client = await db.client.findFirst({
    where: { slug: input.slug },
    select: { id: true, slug: true, name: true, industry: { select: { name: true } } },
  });
  if (!client) return "not_found";

  const sharePlatform = PLATFORM_MAP[input.platform] ?? SharePlatform.OTHER;

  await db.share.create({
    data: {
      clientId: client.id,
      userId: (await input.resolveUserId()) ?? undefined,
      platform: sharePlatform,
      sessionId: input.sessionId,
    },
  });

  const ip =
    input.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    input.headers.get("x-real-ip") ||
    input.headers.get("cf-connecting-ip") ||
    null;
  fireClientEvent(client.id, { kind: "page_share" });
  notifyTelegram(client.id, "clientShare", {
    meta: { المنصة: SHARE_PLATFORM_AR[sharePlatform] },
    ipAddress: ip,
    headers: input.headers,
  }).catch((e: unknown) => console.error("[recordClientShare] telegram", e));

  void trackClientShare({
    client_id: client.id,
    client_slug: client.slug,
    client_name: client.name,
    client_industry: client.industry?.name,
    share_platform: String(sharePlatform).toLowerCase(),
  });

  return "tracked";
}
