/**
 * Light geo-IP lookup for Telegram message enrichment.
 *
 * Strategy (zero-cost first):
 *  1. Read Vercel/Cloudflare geo headers (free, instant, no external call)
 *  2. Fallback to ip-api.com (free tier ~45 req/min, no API key)
 *
 * All errors are swallowed — geo info is "nice to have", never critical.
 */

export interface GeoInfo {
  country?: string;       // English country name (e.g. "Saudi Arabia")
  countryAr?: string;     // Arabic country name from Intl
  countryCode?: string;   // ISO 2-letter (e.g. "SA")
  city?: string;          // English city name
}

const memCache = new Map<string, { value: GeoInfo; ts: number }>();
const TTL_MS = 30 * 60 * 1000; // 30 min

function arCountry(code: string | undefined): string | undefined {
  if (!code) return undefined;
  try {
    return new Intl.DisplayNames(["ar"], { type: "region" }).of(code) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Read Vercel/CF geo headers. Free + instant. Used in production.
 * Returns null if not in a request context or headers absent.
 */
export function readGeoFromHeaders(headers: Headers | null | undefined): GeoInfo | null {
  if (!headers) return null;
  const code =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    null;
  const city =
    headers.get("x-vercel-ip-city") ||
    headers.get("cf-ipcity") ||
    null;
  if (!code && !city) return null;
  return {
    countryCode: code ?? undefined,
    country: undefined,
    countryAr: arCountry(code ?? undefined),
    city: city ? decodeURIComponent(city) : undefined,
  };
}

/**
 * Look up geo info for an IP via ip-api.com. Used in dev (no Vercel/CF headers).
 * Cached in-memory for 30 min per IP.
 */
export async function lookupGeoByIp(ipAddress: string | null | undefined): Promise<GeoInfo> {
  if (!ipAddress || ipAddress === "unknown") return {};
  // Skip private/local IPs
  if (
    ipAddress.startsWith("127.") ||
    ipAddress.startsWith("10.") ||
    ipAddress.startsWith("192.168.") ||
    ipAddress === "::1"
  ) {
    return {};
  }

  const cached = memCache.get(ipAddress);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.value;

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,city`,
      { signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return {};
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
      city?: string;
    };
    if (data.status !== "success") return {};
    const info: GeoInfo = {
      country: data.country,
      countryCode: data.countryCode,
      countryAr: arCountry(data.countryCode),
      city: data.city,
    };
    memCache.set(ipAddress, { value: info, ts: Date.now() });
    return info;
  } catch {
    return {};
  }
}

/**
 * Format a Telegram footer with timestamp + location.
 * Always returns at least the timestamp. Location optional.
 */
export function buildTelegramFooter(geo: GeoInfo | null): string {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

  const lines: string[] = [];
  lines.push("");
  lines.push("━━━━━━━━━━");
  lines.push(`🕐 <code>${time}</code>`);

  const country = geo?.countryAr || geo?.country;
  const city = geo?.city;
  if (country || city) {
    const loc = [city, country].filter(Boolean).join("، ");
    lines.push(`📍 ${loc}`);
  }

  return lines.join("\n");
}
