import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sendAdminTelegram, escapeTgHtml } from "@modonty/database/lib/telegram/client";

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
  };

  await db.systemError.create({
    data: {
      message: String(body.message).slice(0, 1000),
      digest: body.digest ? String(body.digest) : null,
      path: String(body.path).slice(0, 500),
      method: String(body.method),
      routePath: String(body.routePath).slice(0, 500),
      routeType: String(body.routeType),
      source: String(body.source),
    },
  });

  // The /system-errors page is statically cached — without this a freshly logged
  // error stays invisible until a manual delete/clear. Revalidate so it shows now.
  revalidatePath("/system-errors");

  // Push every logged error to the admin Telegram chat for instant awareness.
  // Callers already gate on VERCEL_ENV === "production", so this fires for prod
  // errors only. Never blocks the caller — sendAdminTelegram no-ops on failure.
  const colon = String(body.source).indexOf(":");
  const app = colon === -1 ? "unknown" : String(body.source).slice(0, colon);
  const emoji = APP_EMOJI[app] ?? "⚪️";
  const tg =
    `🚨 ${emoji} <b>Error — ${escapeTgHtml(app)}</b>\n` +
    `${escapeTgHtml(String(body.message).slice(0, 400))}\n` +
    `<code>${escapeTgHtml(String(body.method))} ${escapeTgHtml(safeDecode(String(body.path)).slice(0, 300))}</code>\n` +
    `${escapeTgHtml(String(body.routeType))} · ${escapeTgHtml(String(body.routePath))}` +
    (body.digest ? `\ndigest: <code>${escapeTgHtml(String(body.digest))}</code>` : "");
  await sendAdminTelegram(tg);

  return NextResponse.json({ ok: true });
}
