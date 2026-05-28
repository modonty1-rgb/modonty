"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

/**
 * hreflang Sync — idempotent seed of Settings.defaultAlternateLanguages
 *
 * Target locales: GCC (Saudi, UAE, Kuwait, Qatar, Bahrain, Oman) + Egypt + generic ar + x-default
 * Source of truth: Settings singleton (one row only). Existing entries preserved.
 * URL field: empty by design — modonty fills with each article's canonical at render time.
 */

const HREFLANG_TARGETS: ReadonlyArray<string> = [
  "ar-SA",
  "ar-EG",
  "ar-AE",
  "ar-KW",
  "ar-QA",
  "ar-BH",
  "ar-OM",
  "ar",
  "x-default",
] as const;

interface HreflangSyncStats {
  configured: boolean;
  target: number;
  existing: string[];
  missing: string[];
}

function readExistingHreflangs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const set = new Set<string>();
  for (const entry of raw as Array<unknown>) {
    if (entry && typeof entry === "object" && "hreflang" in entry) {
      const value = (entry as { hreflang?: unknown }).hreflang;
      if (typeof value === "string" && value.trim()) set.add(value.trim());
    }
  }
  return Array.from(set);
}

export async function getHreflangSyncStats(): Promise<HreflangSyncStats> {
  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { defaultAlternateLanguages: true },
  });
  if (!settings) {
    return { configured: false, target: HREFLANG_TARGETS.length, existing: [], missing: [...HREFLANG_TARGETS] };
  }
  const existing = readExistingHreflangs(settings.defaultAlternateLanguages);
  const missing = HREFLANG_TARGETS.filter((t) => !existing.includes(t));
  return { configured: true, target: HREFLANG_TARGETS.length, existing, missing };
}

export async function syncHreflangLocales(): Promise<{
  added: number;
  kept: number;
  total: number;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { id: true, defaultAlternateLanguages: true },
  });
  if (!settings) return { added: 0, kept: 0, total: 0 };

  const existingRaw = Array.isArray(settings.defaultAlternateLanguages)
    ? (settings.defaultAlternateLanguages as Array<{ hreflang?: string; url?: string }>)
    : [];
  const existingSet = new Set<string>();
  for (const e of existingRaw) {
    if (e?.hreflang?.trim()) existingSet.add(e.hreflang.trim());
  }

  const toAdd = HREFLANG_TARGETS.filter((t) => !existingSet.has(t));
  if (toAdd.length === 0) {
    return { added: 0, kept: existingSet.size, total: existingSet.size };
  }

  const merged = [...existingRaw, ...toAdd.map((hreflang) => ({ hreflang }))];

  await db.settings.update({
    where: { id: settings.id },
    data: { defaultAlternateLanguages: merged },
  });

  await revalidateModontyTag("settings");

  return { added: toAdd.length, kept: existingSet.size, total: merged.length };
}
