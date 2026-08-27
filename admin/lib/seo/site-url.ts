import "server-only";
import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

import { SiteUrlMissingError } from "./site-url-error";

export { SiteUrlMissingError };

/**
 * Single source of truth for the site's base URL.
 *
 * Priority:
 *   1. Settings.siteUrl (from DB) — admin-editable, canonical truth
 *   2. NEXT_PUBLIC_SITE_URL env var
 *   3. Nothing — throws `SiteUrlMissingError`. See the class comment for why there is no third.
 *
 * Use this in server actions / SEO generators that need the base URL.
 *
 * Drift detection: if DB.siteUrl ≠ env.NEXT_PUBLIC_SITE_URL, a warning is logged.
 * The DB value always wins (it's the source of truth). Use `getSiteUrlDriftStatus()`
 * for UI banners + maintenance health checks.
 */
export async function loadSiteUrl(): Promise<string> {
  let dbValue: string | undefined;
  try {
    const settings = await db.settings.findUnique({ where: SETTINGS_SINGLETON_WHERE, select: { siteUrl: true } });
    dbValue = settings?.siteUrl?.trim();
  } catch (error) {
    // A DB outage is "we could not read it", not "it is empty" — and the two must not lead to
    // the same place. Say which one happened instead of continuing on a guess.
    throw new Error(
      `تعذّر قراءة رابط الموقع من القاعدة (Settings.siteUrl): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (dbValue) {
    const envValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (envValue && envValue !== dbValue) {
      console.error(
        `[siteUrl drift] DB=${dbValue} · env.NEXT_PUBLIC_SITE_URL=${envValue} — Vercel env should mirror DB. Update Vercel and redeploy.`,
      );
    }
    return dbValue;
  }
  const envValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envValue) return envValue;
  throw new SiteUrlMissingError();
}

/**
 * Synchronous resolution from a pre-fetched Settings row.
 * Use when you already have settings loaded (avoids extra DB hit).
 *
 * Throws for the same reason `loadSiteUrl` does — a caller holding a blank Settings row is
 * exactly the case that used to publish an invented host.
 */
export function resolveSiteUrl(settings?: { siteUrl?: string | null } | null): string {
  const value = settings?.siteUrl?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) throw new SiteUrlMissingError();
  return value;
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
    const settings = await db.settings.findUnique({ where: SETTINGS_SINGLETON_WHERE, select: { siteUrl: true } });
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
      // Names the empty field without asserting what belongs in it — the value is Khalid's
      // to set, and a "should be …" hint here is the same invented host by another route.
      message: !dbValue
        ? "Settings.siteUrl فاضي في القاعدة — اضبطه من /settings قبل أي توليد سيو."
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
