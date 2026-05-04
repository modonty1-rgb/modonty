import "server-only";
import { db } from "@/lib/db";

const HARDCODED_FALLBACK = "https://www.modonty.com";

/**
 * Single source of truth for the site's base URL.
 *
 * Priority:
 *   1. Settings.siteUrl (from DB) — admin-editable, canonical truth
 *   2. NEXT_PUBLIC_SITE_URL env var
 *   3. Hardcoded `https://www.modonty.com` (with www — matches the live deployment)
 *
 * Use this in server actions / SEO generators that need the base URL.
 */
export async function loadSiteUrl(): Promise<string> {
  try {
    const settings = await db.settings.findFirst({ select: { siteUrl: true } });
    if (settings?.siteUrl?.trim()) return settings.siteUrl.trim();
  } catch {
    // DB unavailable — fall through to env
  }
  return process.env.NEXT_PUBLIC_SITE_URL || HARDCODED_FALLBACK;
}

/**
 * Synchronous resolution from a pre-fetched Settings row.
 * Use when you already have settings loaded (avoids extra DB hit).
 */
export function resolveSiteUrl(settings?: { siteUrl?: string | null } | null): string {
  return settings?.siteUrl?.trim() || process.env.NEXT_PUBLIC_SITE_URL || HARDCODED_FALLBACK;
}
