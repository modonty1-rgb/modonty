import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { CTAType } from "@prisma/client";
import { notifyTelegram } from "@/lib/telegram/notify";
import { trackOutboundClick } from "@/lib/analytics/events-registry";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

const VALID_TYPES: CTAType[] = ["BUTTON", "LINK", "FORM", "BANNER", "POPUP"];

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
    const {
      type,
      label,
      targetUrl,
      articleId,
      clientId,
      timeOnPage,
      scrollDepth,
    } = body;

    if (!type || !VALID_TYPES.includes(type as CTAType)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

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
        type: type as CTAType,
        label: typeof label === "string" ? label : null,
        targetUrl: typeof targetUrl === "string" ? targetUrl : null,
        articleId: typeof articleId === "string" ? articleId : undefined,
        clientId: typeof clientId === "string" ? clientId : undefined,
        userId,
        sessionId,
        timeOnPage: typeof timeOnPage === "number" ? timeOnPage : undefined,
        scrollDepth: typeof scrollDepth === "number" ? scrollDepth : undefined,
      },
    });

    if (typeof clientId === "string" && clientId) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        request.headers.get("cf-connecting-ip") ||
        null;
      // Best-effort: show the actual article title (not the internal CTA label,
      // which is an English analytics bucket and would leak into the message).
      const articleTitle =
        typeof articleId === "string" && articleId
          ? (
              await db.article
                .findUnique({ where: { id: articleId }, select: { title: true } })
                .catch(() => null)
            )?.title
          : undefined;
      notifyTelegram(clientId, "articleCtaClick", {
        title: articleTitle,
        meta: {
          النوع: CTA_TYPE_AR[type as CTAType],
          الوجهة: typeof targetUrl === "string" ? targetUrl : undefined,
        },
        ipAddress: ip,
        headers: request.headers,
      }).catch(() => {});
    }

    if (typeof targetUrl === "string" && targetUrl) {
      void trackOutboundClick(
        {
          cta_target_url: targetUrl,
          cta_label: typeof label === "string" ? label : undefined,
          cta_type: typeof type === "string" ? type.toLowerCase() : undefined,
        },
        userId ? { userId } : undefined,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
