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
 *
 * Drift detection: if DB.siteUrl ≠ env.NEXT_PUBLIC_SITE_URL, a warning is logged.
 * The DB value always wins (it's the source of truth). Use `getSiteUrlDriftStatus()`
 * for UI banners + maintenance health checks.
 */
export async function loadSiteUrl(): Promise<string> {
  try {
    const settings = await db.settings.findFirst({ select: { siteUrl: true } });
    const dbValue = settings?.siteUrl?.trim();
    if (dbValue) {
      const envValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();
      if (envValue && envValue !== dbValue) {
        console.error(
          `[siteUrl drift] DB=${dbValue} · env.NEXT_PUBLIC_SITE_URL=${envValue} — Vercel env should mirror DB. Update Vercel and redeploy.`,
        );
      }
      return dbValue;
    }
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

export interface SiteUrlDriftStatus {
  /** True when DB.siteUrl and env.NEXT_PUBLIC_SITE_URL are out of sync (drift). */
  hasDrift: boolean;
  dbValue: string | null;
  envValue: string | null;
  /** Hint message for UI banners (Arabic-friendly). */
  message: string | null;
}

/**
 * Compare DB.siteUrl against the deployed env mirror.
 * Used by /settings banner + /maintenance health KPI.
 */
export async function getSiteUrlDriftStatus(): Promise<SiteUrlDriftStatus> {
  const envValue = process.env.NEXT_PUBLIC_SITE_URL?.trim() || null;
  let dbValue: string | null = null;
  try {
    const settings = await db.settings.findFirst({ select: { siteUrl: true } });
    dbValue = settings?.siteUrl?.trim() || null;
  } catch {
    return {
      hasDrift: false,
      dbValue: null,
      envValue,
      message: null, // can't determine drift if DB unreachable
    };
  }
  if (!dbValue || !envValue) {
    return {
      hasDrift: false,
      dbValue,
      envValue,
      message: !dbValue
        ? "Settings.siteUrl غير محدّد في DB — يفترض يكون https://www.modonty.com"
        : null,
    };
  }
  if (dbValue === envValue) {
    return { hasDrift: false, dbValue, envValue, message: null };
  }
  return {
    hasDrift: true,
    dbValue,
    envValue,
    message: `⚠️ تضارب: Settings.siteUrl في DB = ${dbValue} · env في Vercel = ${envValue}. حدّث NEXT_PUBLIC_SITE_URL في Vercel ليطابق DB ثم redeploy.`,
  };
}
