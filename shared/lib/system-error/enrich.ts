// Turn a captured error into a traceable record: device, bot, geo + a framework/app
// classification so Next/React internal errors are separated from our own bugs.

const BOTS: { re: RegExp; name: string }[] = [
  { re: /googlebot/i, name: "Googlebot" },
  { re: /bingbot/i, name: "Bingbot" },
  { re: /twitterbot/i, name: "Twitterbot" },
  { re: /facebookexternalhit|facebot/i, name: "Facebook" },
  { re: /slackbot/i, name: "Slackbot" },
  { re: /whatsapp/i, name: "WhatsApp" },
  { re: /telegrambot/i, name: "TelegramBot" },
  { re: /yandex(bot)?/i, name: "YandexBot" },
  { re: /duckduckbot/i, name: "DuckDuckBot" },
  { re: /applebot/i, name: "Applebot" },
  { re: /petalbot/i, name: "PetalBot" },
  { re: /ahrefsbot/i, name: "AhrefsBot" },
  { re: /semrushbot/i, name: "SemrushBot" },
  { re: /gptbot|oai-searchbot|chatgpt/i, name: "GPTBot" },
  { re: /claudebot|anthropic/i, name: "ClaudeBot" },
  { re: /bot\b|crawler|spider|crawl/i, name: "Bot" }, // catch-all — keep last
];

export function detectBot(ua: string): string | null {
  for (const b of BOTS) if (b.re.test(ua)) return b.name;
  return null;
}

export function deviceFromUA(ua: string, isBot: boolean): "bot" | "mobile" | "tablet" | "desktop" {
  if (isBot) return "bot";
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobile|iphone|android|ipod|windows phone|blackberry/i.test(ua)) return "mobile";
  return "desktop";
}

// Signatures of Next.js / React internal errors — NOT our app's bugs. Kept small and
// explicit so we never mislabel a real app error as "framework".
const FRAMEWORK_SIGNATURES: RegExp[] = [
  /__next_metadata_boundary__/i,
  /the resume to render/i,
  /fallback to client rendering/i,
  /the tree doesn'?t match/i,
  /the render was aborted/i,
  // Browser auto-translation re-parents text nodes behind React's back, so React's own
  // DOM removal throws. Not ours to fix and not fixable in app code (React #11538) — kept
  // in the log, but classified framework so it never pings Telegram. Deliberately matched
  // on the full DOM-exception wording so a real app error mentioning a node can't hit it.
  /failed to execute '(removechild|insertbefore)' on 'node'/i,
];

/** framework = Next/React internals we can't fix in app code · app = ours to fix. */
export function classifyCategory(
  message: string,
  renderType?: string | null,
  revalidateReason?: "on-demand" | "stale" | undefined
): "framework" | "app" {
  // A hang-up signature during a BACKGROUND regeneration is ours, not a reader's — see
  // `isReaderHangUp` below. Checked first so it outranks the framework signatures.
  if (isClientAbort(message)) {
    return isReaderHangUp(message, revalidateReason) ? "framework" : "app";
  }
  if (renderType === "dynamic-resume") return "framework";
  if (FRAMEWORK_SIGNATURES.some((re) => re.test(message || ""))) return "framework";
  return "app";
}

/**
 * The reader hung up — not a fault, and never worth an alert.
 *
 * «Connection closed.» is thrown by React itself, not by our code. `ReactFlightClient.close()`
 * rejects every still-pending chunk when the RSC stream ends early:
 *   `reportGlobalError(weakResponse, new Error('Connection closed.'))`
 * and React's own `codes.json` maps it as error 412. It means the browser stopped reading before
 * the stream finished — the visitor navigated away, backgrounded the tab, or a mobile connection
 * dropped. The page itself is fine: measured 31 Aug 2026, the very article that produced 17 of
 * these answered `HTTP 200` in 1.7s on three consecutive requests.
 *
 * Next.js already treats this class as noise inside its own pipeline. `pipe-readable.ts`:
 *   `if (isAbortError(err)) return`  — «prevents noise from expected navigation cancellations»
 * But that guard sits in Next's writer; this instance surfaces from React's Flight layer, so it
 * escapes to `onRequestError` and reaches our log — and from there Telegram, at ~27/hour.
 *
 * So we apply Next's own policy at our sink: a hang-up is not an error. Everything else still
 * logs, so a real failure on the same route is not hidden by this rule.
 */
const CLIENT_ABORT_SIGNATURES: RegExp[] = [
  /^Connection closed\.?$/i,
  /\bAbortError\b/,
  /\bResponseAborted\b/,
  /\bThe user aborted a request\b/i,
  /\brequest aborted\b/i,
];

export function isClientAbort(message: string): boolean {
  const m = (message || "").trim();
  return CLIENT_ABORT_SIGNATURES.some((re) => re.test(m));
}

/**
 * Was there actually a reader to hang up?
 *
 * The signature alone cannot tell a visitor closing a tab from OUR render dying mid-stream:
 * both surface as «Connection closed.». Dropping every match (as this module did from
 * 3f98bdb until 1 Sep 2026) also dropped the genuine failures — the article error boundary
 * fired live at 07:47 on 1 Sep and `system_errors` held zero rows for any `/articles/[slug]`
 * path, because this exact rule deleted them before the sink.
 *
 * `revalidateReason` is the discriminator, and it is part of Next's documented
 * `onRequestError` context (`next/dist/server/instrumentation/types.d.ts:6`):
 *   'on-demand' | 'stale'  → a BACKGROUND regeneration. No browser is attached to it, so
 *                            nothing can hang up: the stream died on our side.
 *   undefined              → an ordinary request with a live reader, who may well have left.
 *
 * So: undefined ⇒ treat as a hang-up (logged, category `framework`, no Telegram).
 * Set ⇒ treat as a real failure (logged, category `app`, Telegram rings).
 * Either way the row is written — visibility is never traded for quiet.
 */
export function isReaderHangUp(
  message: string,
  revalidateReason?: "on-demand" | "stale" | undefined
): boolean {
  return isClientAbort(message) && revalidateReason === undefined;
}

export interface ErrorEnrichment {
  category: "framework" | "app";
  device: string;
  botName: string | null;
  country: string | null;
  city: string | null;
  userAgent: string | null;
}

type Headers = Record<string, string | string[] | undefined>;
const pick = (headers: Headers, key: string): string | null => {
  const v = headers[key] ?? headers[key.toLowerCase()];
  const s = Array.isArray(v) ? v[0] : v;
  return s ? String(s) : null;
};

export function enrichError(
  headers: Headers,
  message: string,
  renderType?: string | null,
  revalidateReason?: "on-demand" | "stale" | undefined
): ErrorEnrichment {
  const ua = pick(headers, "user-agent") ?? "";
  const botName = ua ? detectBot(ua) : null;
  const cityRaw = pick(headers, "x-vercel-ip-city");
  return {
    category: classifyCategory(message, renderType, revalidateReason),
    device: deviceFromUA(ua, Boolean(botName)),
    botName,
    country: pick(headers, "x-vercel-ip-country"),
    city: cityRaw ? (() => { try { return decodeURIComponent(cityRaw); } catch { return cityRaw; } })() : null,
    userAgent: ua || null,
  };
}
