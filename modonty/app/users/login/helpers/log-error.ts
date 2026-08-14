import "server-only";

interface LogErrorInput {
  message: string;
  path: string;
  method?: string;
  routePath?: string;
  routeType?: string;
  source: string;
  digest?: string | null;
}

// Ships an error to the admin SystemError sink — the same log `/system-errors`
// reads, and the same endpoint `instrumentation.onRequestError` posts to. Use it
// for failures Next never throws (e.g. NextAuth OAuth callback errors, which are
// handled internally as a redirect and so never reach onRequestError).
// Fire-and-forget by design: never throws, never blocks the caller.
export async function logError(input: LogErrorInput): Promise<void> {
  // Production only — the sink is the prod admin, so logging from local dev (or a
  // preview deploy) would pollute the production error log. `.env.shared` carries
  // the secret into dev too, so the secret check alone is not enough.
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
        message: input.message,
        digest: input.digest ?? null,
        path: input.path,
        method: input.method ?? "GET",
        routePath: input.routePath ?? input.path,
        routeType: input.routeType ?? "auth",
        source: input.source,
      }),
      signal: AbortSignal.timeout(2500),
    });
  } catch {
    // never crash the app over error logging
  }
}
