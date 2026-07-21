import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { classifyTrafficSource } from "@/lib/analytics/classify-source";
import { getGeoFromHeaders } from "@/lib/analytics/geo-headers";
import { notifyTelegram } from "@/lib/telegram/notify";
import { trackClientView } from "@/lib/analytics/events-registry";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const client = await db.client.findFirst({
      where: { slug: decodedSlug },
      select: { id: true, slug: true, name: true, industry: { select: { name: true } } },
    });

    if (!client) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get(VIEW_SESSION_COOKIE)?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      cookieStore.set(VIEW_SESSION_COOKIE, sessionId, {
        maxAge: SESSION_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    // External referrer comes from the browser (document.referrer) — the request's
    // own Referer header is always our page URL (pre-2026-07-07 bug).
    const body = (await request.json().catch(() => null)) as { referrer?: string | null } | null;
    const referrer = body?.referrer?.trim() || null;

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || null;
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null;

    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    // Honest views: count every genuine entry; suppress only a refresh-in-place —
    // i.e. the session's most recent client view is the SAME client (consecutive
    // duplicate). Returning here after visiting another page counts again.
    const lastView = await db.clientView.findFirst({
      where: userId ? { userId } : { sessionId },
      orderBy: { createdAt: "desc" },
      select: { clientId: true },
    });
    if (lastView?.clientId === client.id) {
      return NextResponse.json({ ok: true, deduplicated: true });
    }

    const host = headersList.get("host") || null;
    const { source, referrerDomain, searchEngine } = classifyTrafficSource(referrer, null, host);
    const { country, region, city } = getGeoFromHeaders(headersList);

    await db.clientView.create({
      data: {
        clientId: client.id,
        userId,
        sessionId,
        referrer,
        userAgent,
        ipAddress,
        source,
        referrerDomain,
        searchEngine,
        country,
        region,
        city,
      },
    });

    const formatReferrer = (r: string | null): string => {
      if (!r) return "مباشر";
      try {
        const u = new URL(r);
        return `${u.hostname}${decodeURIComponent(u.pathname)}`;
      } catch {
        try {
          return decodeURIComponent(r);
        } catch {
          return r;
        }
      }
    };
    notifyTelegram(client.id, "clientView", {
      meta: { من: formatReferrer(referrer) },
      ipAddress,
      headers: headersList,
    }).catch(() => {});

    void trackClientView(
      {
        client_id: client.id,
        client_slug: client.slug,
        client_name: client.name,
        client_industry: client.industry?.name,
      },
      userId ? { userId } : undefined,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
