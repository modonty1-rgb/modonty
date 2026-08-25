"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

/**
 * The hreflang locale list — the one place it is decided.
 *
 * Every page on modonty builds its `alternates.languages` from this column, so it is the only
 * thing standing between the team and a deploy whenever a market is added. Until now it had
 * no editor at all: it was seeded by a maintenance button holding nine locales typed into the
 * code, and nothing in the admin could show or change them (measured 25 Aug 2026 — zero `.tsx`
 * in the admin referenced the column).
 *
 * Shape stored: `[{ hreflang, url }]`. `url` stays empty on purpose — an empty url means "the
 * same Arabic content serves that market", so each page points the entry at its own canonical.
 * That is what makes one article declare nine markets without nine copies existing.
 */

/**
 * A tag Google accepts: a language, optionally a script, optionally a region — or the literal
 * `x-default`. Google: "the value must be in ISO 639-1 format for language and, optionally,
 * ISO 3166-1 Alpha 2 format for region"
 * (developers.google.com/search/docs/specialty/international/localized-versions).
 *
 * Rejecting a malformed tag here matters more than it looks: Google ignores the whole
 * annotation for a bad value, so one typo silently removes a market rather than warning.
 */
const LOCALE = /^(x-default|[a-z]{2,3}(-[A-Z][a-z]{3})?(-([A-Z]{2}|\d{3}))?)$/;

const schema = z.object({
  locales: z
    .array(z.string().trim().min(1))
    .max(60, "أكثر من ستّين لغة — الرقم هذا غلط غالباً")
    .refine((list) => list.every((l) => LOCALE.test(l)), {
      message: "فيه رمز لغة غير صالح — الصيغة: ar أو ar-SA أو x-default",
    })
    .refine((list) => new Set(list).size === list.length, {
      message: "فيه رمز مكرّر — كل لغة مرّة واحدة",
    }),
});

export async function saveAlternateLanguages(
  locales: string[],
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };

  const parsed = schema.safeParse({ locales });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "قيمة غير صالحة" };
  }

  // Google: "Each language version must list itself as well as all other language versions."
  // `buildHreflangLanguages` adds a self-referencing x-default when the list omits it, so the
  // page is never wrong — but the stored list should say what the pages ship, not rely on a
  // fallback to correct it.
  const clean = parsed.data.locales;
  const withDefault = clean.includes("x-default") ? clean : [...clean, "x-default"];

  try {
    await db.settings.update({
      where: SETTINGS_SINGLETON_WHERE,
      data: {
        defaultAlternateLanguages: withDefault.map((hreflang) => ({ hreflang, url: "" })),
      },
    });

    // Every page's stored blob carries a copy of this map, so the pages that render from a
    // blob keep the OLD list until they are regenerated. Busting the cache is not enough on
    // its own — the operator is told to run the cascade, and this is where that is said.
    await revalidateModontyTag("settings").catch(() => {});

    return { success: true, count: withDefault.length };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ما قدرنا نحفظ اللغات",
    };
  }
}
