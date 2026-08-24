import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { CTAType } from "@prisma/client";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackOutboundClick } from "@/lib/analytics/events-registry";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ctaClickSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      type,
      label,
      targetUrl,
      articleId,
      clientId,
      timeOnPage,
      scrollDepth,
    } = parsed.data;

    const cookieStore = await cookies();
    let sessionId = cookieStore.get(VIEW_SESSION_COOKIE)?.value;
    if (!sessionId) {
      sessionId = `view-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      cookieStore.set(VIEW_SESSION_COOKIE, sessionId, {
        maxAge: SESSION_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    await db.cTAClick.create({
      data: {
        type,
        label: label ?? null,
        targetUrl: targetUrl ?? null,
        articleId,
        clientId,
        userId,
        sessionId,
        timeOnPage,
        scrollDepth,
      },
    });

    if (clientId) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        request.headers.get("cf-connecting-ip") ||
        null;
      // Best-effort: show the actual article title (not the internal CTA label,
      // which is an English analytics bucket and would leak into the message).
      const article = articleId
        ? await db.article
            .findUnique({ where: { id: articleId }, select: { title: true, clientId: true } })
            .catch(() => null)
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
            headers: request.headers,
          }).catch(() => {});
        }
      }
    }

    if (targetUrl) {
      void trackOutboundClick(
        {
          cta_target_url: targetUrl,
          cta_label: label,
          cta_type: type.toLowerCase(),
        },
        userId ? { userId } : undefined,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
