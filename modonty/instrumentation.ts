import type { Instrumentation } from "next";
import { enrichError } from "@modonty/shared/lib/system-error/enrich";

export async function register() {}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  // Deployed environments only — never a developer's machine (`.env.shared` carries the
  // secret into dev, so a local run would post into the production log).
  //
  // Preview was excluded until 1 Sep 2026, and that exclusion is what blinded us to the
  // live article failure: `test.modonty.com` reproduces «المقال ما فتحت» on 10 of 20
  // articles, and not one of those renders could reach the log — the branch returned here
  // before ever building a payload. The sink now accepts preview too, tagged with its
  // environment so the admin list can tell a test failure from a production one.
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv !== "production" && vercelEnv !== "preview") return;

  const secret = process.env.INTERNAL_LOG_SECRET;
  if (!secret) return;

  const baseMessage = (err as Error).message || "Unknown error";

  // On preview only, carry the first frames of the stack inside the message. The admin has no
  // `stack` column and a production schema must not be changed for a diagnosis; the sink caps
  // `message` at 1000 chars, so three frames are the most that fits without crowding it out.
  const stackHead = (err as Error).stack
    ?.split("\n")
    .slice(1, 4)
    .map((l) => l.trim())
    .join(" ← ");
  const message =
    vercelEnv === "preview" && stackHead ? `${baseMessage} ⟪${stackHead}⟫` : baseMessage;
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
  // `baseMessage`, not `message`: classification matches on the error text, and the appended
  // stack frames would change what it matches.
  const meta = enrichError(request.headers, baseMessage, renderType, context.revalidateReason);

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
        // Preview rows carry their environment in the app half — no schema or admin change
        // needed to tell «modonty» apart from «modonty-preview» in the same list.
        source: `${vercelEnv === "preview" ? "modonty-preview" : "modonty"}:${context.renderSource ?? "server"}`,
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
