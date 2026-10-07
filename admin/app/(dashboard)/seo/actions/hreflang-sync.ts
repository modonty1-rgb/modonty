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
