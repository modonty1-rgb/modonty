import type { Instrumentation } from "next";
import { enrichError } from "@modonty/shared/lib/system-error/enrich";

export async function register() {}

// Ships server errors to the shared admin SystemError log (/system-errors), the
// same sink admin + modonty already feed. Without this, console errors were a
// blind spot — never captured anywhere.
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  // Production only — the sink is the prod admin; dev/preview errors must not
  // pollute the production error log (the shared secret reaches dev too).
  if (process.env.VERCEL_ENV !== "production") return;

  const secret = process.env.INTERNAL_LOG_SECRET;
  if (!secret) return;

  const message = (err as Error).message || "Unknown error";
  // A hang-up is no longer DROPPED here — it is classified. See the full rationale in
  // `shared/lib/system-error/enrich.ts` (`isReaderHangUp`): dropping every «Connection closed.»
  // also deleted the genuine mid-render failures, because both carry that same message.
  // Silencing belongs at the ALERT (`log-error/route.ts:77` pings only when category !== "framework"),
  // not at the sink — so every error is written and `revalidateReason` decides which may ring.
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
        // App tag so console errors are distinguishable in the unified log.
        source: `console:${context.renderSource ?? "server"}`,
        renderType,
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
