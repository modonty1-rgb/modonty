import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const VIEW_SESSION_COOKIE = "modonty_view_sid";

// The beacon fires on page-hide with nothing authenticating it, so the numbers are
// bounded here: scrollDepth is a percentage, the rest are durations that only run
// forwards. Anything outside those ranges is a hand-made payload, not a reader.
const analyticsUpdateSchema = z.object({
  timeOnPage: z.number().min(0).optional(),
  scrollDepth: z.number().min(0).max(100).optional(),
  bounced: z.boolean().optional(),
  lcp: z.number().min(0).optional(),
  cls: z.number().min(0).optional(),
  inp: z.number().min(0).optional(),
});

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json().catch(() => ({}));
    const parsed = analyticsUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { timeOnPage, scrollDepth, bounced, lcp, cls, inp } = parsed.data;

    const existing = await db.analytics.findUnique({
      where: { id },
      select: { id: true, sessionId: true },
    });
    if (!existing) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get(VIEW_SESSION_COOKIE)?.value;
    // The row belongs to the visit that created it, and this cookie is the only thing
    // that names that visit. The old check skipped itself whenever the cookie was absent,
    // so a bare `curl -X PATCH` — no account, no cookie — could rewrite any row's
    // engagement numbers, the same numbers every partner report is built from.
    if (!sessionId || sessionId !== existing.sessionId) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    await db.analytics.update({
      where: { id },
      data: {
        ...(timeOnPage !== undefined && { timeOnPage }),
        ...(scrollDepth !== undefined && { scrollDepth }),
        ...(bounced !== undefined && { bounced }),
        ...(lcp !== undefined && { lcp }),
        ...(cls !== undefined && { cls }),
        ...(inp !== undefined && { inp }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
