import type { Instrumentation } from "next";
import { enrichError } from "@modonty/shared/lib/system-error/enrich";

export async function register() {}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  // Production only — the sink is the prod admin; dev/preview errors must not
  // pollute the production error log (`.env.shared` carries the secret into dev).
  if (process.env.VERCEL_ENV !== "production") return;

  const secret = process.env.INTERNAL_LOG_SECRET;
  if (!secret) return;

  const message = (err as Error).message || "Unknown error";
  // A hang-up is no longer DROPPED here — it is classified.
  //
  // From 3f98bdb until 1 Sep 2026 this line read `if (isClientAbort(message)) return;`, to stop
  // Telegram ringing ~27/hour on ordinary browsing. It worked, and it also blinded us: «Connection
  // closed.» is the very message a FAILED article render produces, so the genuine failures were
  // deleted alongside the harmless ones. Measured 1 Sep: the article boundary fired live at 07:47
  // while `system_errors` held zero rows for any `/articles/[slug]` path.
  //
  // Silencing belongs at the ALERT, not at the SINK: `admin/api/internal/log-error/route.ts:77`
  // already pings Telegram only when `category !== "framework"`. So every error is written now,
  // and `classifyCategory` decides which ones are allowed to ring — using `revalidateReason` to
  // tell a reader who left (no alert) from a background regeneration that died (alert).
  const renderType = (context as { renderType?: string }).renderType ?? null;
  const meta = enrichError(request.headers, message, renderType, context.revalidateReason);

  try {
    await fetch("https://admin.modonty.com/api/internal/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": secret,
      },
      body: JSON.stringify({
        message,
        digest: (err as Error & { digest?: string }).digest ?? null,
        path: request.path,
        method: request.method,
        routePath: context.routePath,
        routeType: context.routeType,
        // App tag (<app>:<renderSource>) so the unified log shows which app failed.
        source: `modonty:${context.renderSource ?? "server"}`,
        renderType,
        // Carried so the admin log can show WHY a hang-up was or wasn't alerted:
        // 'stale'/'on-demand' = background regeneration (no reader) · undefined = live request.
        revalidateReason: context.revalidateReason ?? null,
        category: meta.category,
        device: meta.device,
        botName: meta.botName,
        country: meta.country,
        city: meta.city,
        userAgent: meta.userAgent,
      }),
    });
  } catch {
    // never crash the app over error logging
  }
};
