import type { Instrumentation } from "next";

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

  try {
    await fetch("https://admin.modonty.com/api/internal/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": secret,
      },
      body: JSON.stringify({
        message: (err as Error).message || "Unknown error",
        digest: (err as Error & { digest?: string }).digest ?? null,
        path: request.path,
        method: request.method,
        routePath: context.routePath,
        routeType: context.routeType,
        // App tag so console errors are distinguishable in the unified log.
        source: `console:${context.renderSource ?? "server"}`,
      }),
    });
  } catch {
    // never crash the app over error logging
  }
};
