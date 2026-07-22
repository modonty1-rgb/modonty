import type { Instrumentation } from "next";
import { enrichError } from "@modonty/database/lib/system-error/enrich";

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
  // renderType ("dynamic" | "dynamic-resume") flags PPR-resume errors; may be absent
  // on older Next — read defensively, classification falls back to message signatures.
  const renderType = (context as { renderType?: string }).renderType ?? null;
  const meta = enrichError(request.headers, message, renderType);

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
