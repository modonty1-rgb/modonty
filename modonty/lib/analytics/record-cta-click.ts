import "server-only";

import { z } from "zod";
import { CTAType } from "@prisma/client";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { resolveArticleFromRecentView } from "@/lib/analytics/resolve-article-from-recent-view";

// Nothing authenticates a click, so the payload is bounded before it reaches the DB or a
// partner's Telegram: an id that isn't ObjectId-shaped is a wasted lookup, and `label` +
// `targetUrl` are capped because both are echoed into the notification message.
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

const ctaClickSchema = z.object({
  type: z.nativeEnum(CTAType),
  label: z.string().max(300).optional(),
  // Deliberately not `.url()`: real CTAs point at `tel:`, `mailto:` and `#` as well.
  targetUrl: z.string().max(2048).optional(),
  articleId: objectId.optional(),
  clientId: objectId.optional(),
  timeOnPage: z.number().min(0).optional(),
  scrollDepth: z.number().min(0).max(100).optional(),
});

// Ceiling on notifications per partner per hour. The click itself is always recorded, so
// the analytics stay honest; only the message is dropped past the cap. Without it a loop
// on one clientId turns that partner's chat — and the admin mirror — into a firehose.
const NOTIFY_HOURLY_CAP = 20;

// Arabic labels for the Telegram notification (enum values are English).
const CTA_TYPE_AR: Record<CTAType, string> = {
  BUTTON: "زر",
  LINK: "رابط",
  FORM: "نموذج",
  BANNER: "بانر",
  POPUP: "نافذة منبثقة",
};

export type CtaClickResult =
  | { kind: "invalid"; fields: Record<string, string[] | undefined> }
  | { kind: "recorded" };

/**
 * One CTA click — the body of `POST /api/track/cta-click` with the visit passed in (web: the
 * `modonty_view_sid` cookie · app: `app:<X-Device-Id>`). A click on the client's own page is
 * credited to the article this visit read; Telegram is capped at 20 per partner per hour and is
 * sent only when the article really belongs to the named partner.
 */
export async function recordCtaClick(input: {
  body: unknown;
  sessionId: string;
  resolveUserId: () => Promise<string | undefined>;
  headers: Headers;
}): Promise<CtaClickResult> {
  const parsed = ctaClickSchema.safeParse(input.body);
  if (!parsed.success) {
    return { kind: "invalid", fields: parsed.error.flatten().fieldErrors };
  }

  const { type, label, targetUrl, articleId, clientId, timeOnPage, scrollDepth } = parsed.data;
  const { sessionId } = input;
  const userId = await input.resolveUserId();

  // A click on the client's own page (call · WhatsApp · site) is credited to the article this
  // visitor read — same session, same rule as the leads (resolve-article-from-recent-view.ts).
  const creditedArticleId = articleId ?? (clientId ? (await resolveArticleFromRecentView(clientId, sessionId)) ?? undefined : undefined);

  await db.cTAClick.create({
    data: {
      type,
      label: label ?? null,
      targetUrl: targetUrl ?? null,
      articleId: creditedArticleId,
      clientId,
      userId,
      sessionId,
      timeOnPage,
      scrollDepth,
    },
  });

  if (clientId) {
    const ip =
      input.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      input.headers.get("x-real-ip") ||
      input.headers.get("cf-connecting-ip") ||
      null;
    // Best-effort: show the actual article title (not the internal CTA label,
    // which is an English analytics bucket and would leak into the message).
    const article = articleId
      ? await db.article
          .findUnique({ where: { id: articleId }, select: { title: true, clientId: true } })
          .catch((e: unknown) => {
            console.error("[recordCtaClick] article lookup", e);
            return null;
          })
      : null;

    // The partner named in the payload must be the one the article belongs to. Every
    // real CTA sends an article together with that article's own client; a payload
    // pairing a real article with someone else's id is a stranger picking the
    // recipient, and that partner would read it as traffic that was never theirs.
    const clientOwnsArticle = !articleId || article?.clientId === clientId;

    if (clientOwnsArticle) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentCount = await db.cTAClick.count({
        where: { clientId, createdAt: { gt: oneHourAgo } },
      });

      if (recentCount <= NOTIFY_HOURLY_CAP) {
        notifyTelegram(clientId, "articleCtaClick", {
          title: article?.title,
          meta: {
            النوع: CTA_TYPE_AR[type],
            الوجهة: targetUrl,
          },
          ipAddress: ip,
          headers: input.headers,
        }).catch((e: unknown) => console.error("[recordCtaClick] telegram", e));
      }
    }
  }

  return { kind: "recorded" };
}
