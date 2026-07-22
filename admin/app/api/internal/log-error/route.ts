import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sendAdminTelegram, escapeTgHtml } from "@modonty/database/lib/telegram/client";
import { classifyCategory } from "@modonty/database/lib/system-error/enrich";

const APP_EMOJI: Record<string, string> = {
  modonty: "🟢",
  admin: "🔵",
  console: "🟣",
};

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.INTERNAL_LOG_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    message: string;
    digest?: string | null;
    path: string;
    method: string;
    routePath: string;
    routeType: string;
    source: string;
    category?: string | null;
    renderType?: string | null;
    device?: string | null;
    botName?: string | null;
    country?: string | null;
    city?: string | null;
    userAgent?: string | null;
  };

  // Classify server-side so it's consistent regardless of the caller (instrumentation
  // sends a category; the OAuth logError helper doesn't — we derive it here either way).
  const category =
    body.category === "framework" || body.category === "app"
      ? body.category
      : classifyCategory(String(body.message), body.renderType);

  await db.systemError.create({
    data: {
      message: String(body.message).slice(0, 1000),
      digest: body.digest ? String(body.digest) : null,
      path: String(body.path).slice(0, 500),
      method: String(body.method),
      routePath: String(body.routePath).slice(0, 500),
      routeType: String(body.routeType),
      source: String(body.source),
      category,
      renderType: body.renderType ? String(body.renderType) : null,
      device: body.device ? String(body.device) : null,
      botName: body.botName ? String(body.botName) : null,
      country: body.country ? String(body.country) : null,
      city: body.city ? String(body.city).slice(0, 120) : null,
      userAgent: body.userAgent ? String(body.userAgent).slice(0, 500) : null,
    },
  });

  // The /system-errors page is statically cached — without this a freshly logged
  // error stays invisible until a manual delete/clear. Revalidate so it shows now.
  revalidatePath("/system-errors");

  // Telegram: ping for APP errors only. Framework errors (Next/React internals) are
  // logged + badged in the table but never pinged — they aren't ours to chase, and
  // pinging them would drown the real bugs (Khalid 2026-07-22).
  if (category !== "framework") {
    const colon = String(body.source).indexOf(":");
    const app = colon === -1 ? "unknown" : String(body.source).slice(0, colon);
    const emoji = APP_EMOJI[app] ?? "⚪️";
    const geo = [body.country, body.city].filter(Boolean).join(" · ");
    const tg =
      `🚨 ${emoji} <b>Error — ${escapeTgHtml(app)}</b>\n` +
      `${escapeTgHtml(String(body.message).slice(0, 400))}\n` +
      `<code>${escapeTgHtml(String(body.method))} ${escapeTgHtml(safeDecode(String(body.path)).slice(0, 300))}</code>\n` +
      `${escapeTgHtml(String(body.routeType))} · ${escapeTgHtml(String(body.routePath))}` +
      (body.device ? `\n📱 ${escapeTgHtml(String(body.device))}${body.botName ? ` (${escapeTgHtml(String(body.botName))})` : ""}` : "") +
      (geo ? ` · 🌍 ${escapeTgHtml(geo)}` : "") +
      (body.digest ? `\ndigest: <code>${escapeTgHtml(String(body.digest))}</code>` : "");
    await sendAdminTelegram(tg);
  }

  return NextResponse.json({ ok: true });
}
