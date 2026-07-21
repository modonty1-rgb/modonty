import type { Instrumentation } from "next";

export async function register() {}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  // Production only — dev/preview errors must not pollute the production log.
  if (process.env.VERCEL_ENV !== "production") return;

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const secret = process.env.INTERNAL_LOG_SECRET;

  if (!secret) return;

  try {
    await fetch(`${baseUrl}/api/internal/log-error`, {
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
        // App tag (<app>:<renderSource>) so the unified log shows which app failed.
        source: `admin:${context.renderSource ?? "server"}`,
      }),
    });
  } catch {
    // never crash the app over error logging
  }
};
