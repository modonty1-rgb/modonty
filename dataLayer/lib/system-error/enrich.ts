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
];

/** framework = Next/React internals we can't fix in app code · app = ours to fix. */
export function classifyCategory(message: string, renderType?: string | null): "framework" | "app" {
  if (renderType === "dynamic-resume") return "framework";
  if (FRAMEWORK_SIGNATURES.some((re) => re.test(message || ""))) return "framework";
  return "app";
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

export function enrichError(headers: Headers, message: string, renderType?: string | null): ErrorEnrichment {
  const ua = pick(headers, "user-agent") ?? "";
  const botName = ua ? detectBot(ua) : null;
  const cityRaw = pick(headers, "x-vercel-ip-city");
  return {
    category: classifyCategory(message, renderType),
    device: deviceFromUA(ua, Boolean(botName)),
    botName,
    country: pick(headers, "x-vercel-ip-country"),
    city: cityRaw ? (() => { try { return decodeURIComponent(cityRaw); } catch { return cityRaw; } })() : null,
    userAgent: ua || null,
  };
}
