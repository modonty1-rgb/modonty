import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateArticleAnalytics } from "@/lib/analytics/update-article-analytics";

const VIEW_SESSION_COOKIE = "modonty_view_sid";

/** Web door: the visit cookie names the owner; the logic lives in `updateArticleAnalytics`. */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json().catch(() => ({}));
    const sessionId = (await cookies()).get(VIEW_SESSION_COOKIE)?.value;

    const result = await updateArticleAnalytics(id, body, sessionId);
    if (result.kind === "invalid") {
      return NextResponse.json({ ok: false, fields: result.fields }, { status: 400 });
    }
    if (result.kind === "not_found") return NextResponse.json({ ok: false }, { status: 404 });
    if (result.kind === "forbidden") return NextResponse.json({ ok: false }, { status: 403 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[articles/api/analytics]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
