import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { recordClientView } from "../../helpers/record-client-view";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

// Web door: the dedupe key is the `modonty_view_sid` cookie. The counting rule lives in
// ../../helpers/record-client-view.ts, shared with the mobile API (keyed on X-Device-Id).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // External referrer comes from the browser (document.referrer) — the request's
    // own Referer header is always our page URL (pre-2026-07-07 bug).
    const body = (await request.json().catch(() => null)) as { referrer?: string | null } | null;

    const result = await recordClientView({
      slug: decodedSlug,
      referrer: body?.referrer?.trim() || null,
      headers: await headers(),
      resolveSessionId: async () => {
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
        return sessionId;
      },
      resolveUserId: async () => (await auth())?.user?.id ?? undefined,
    });

    if (!result.found) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    if (result.deduplicated) {
      return NextResponse.json({ ok: true, deduplicated: true });
    }
    return NextResponse.json({ ok: true, ga4: result.ga4 });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
