import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

import type { Brief } from "../helpers/types";

/**
 * Each list keeps its own row of translations, so an item is paid for once — not on every refresh.
 * One shared row was tried first: the four lists load together, each wrote the row over the others,
 * and only the last list's translations survived (5 of 17, measured 28 Sep 2026). A list only ever
 * loads once at a time (its snapshot claim), so its own row has a single writer.
 */
/** Enough for many weeks of one list; the oldest drop out first. */
const KEEP = 200;

export interface BriefSource {
  /** Stable per item: «hf:Qwen/Qwen-Image-2.1», «arxiv:2609.12345», «gh:owner/repo». */
  id: string;
  /** The source's own description, any language — Google detects it. */
  text: string;
}

async function translate(texts: string[]): Promise<(Brief | null)[]> {
  // Set locally in modonty/.env.local (28 Sep 2026); a key restricted to the Cloud Translation API
  // in Google Cloud project modonty-c0b31. First 500,000 characters a month are free.
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) return texts.map(() => null);
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, target: "ar", format: "text" }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`google-translate ${res.status}`);
  const json = (await res.json()) as { data?: { translations?: { translatedText?: string; detectedSourceLanguage?: string }[] } };
  return texts.map((_, i) => {
    const t = json.data?.translations?.[i];
    const text = t?.translatedText?.trim();
    return text ? { text, from: t?.detectedSourceLanguage || "und" } : null;
  });
}

/**
 * An Arabic line for each item, from its own description (Khalid, 28 Sep 2026: «احنا منصة عربية…
 * تحت كل رائجة… بريف»). Google Translate turns the source's words into Arabic — nothing is written
 * that the source did not say. Only items never seen before are sent; a failed call leaves those
 * without a line and the list still shows.
 */
export async function getArabicBriefs(list: string, sources: BriefSource[]): Promise<Record<string, Brief>> {
  const cacheKey = `ai:briefs:ar:${list}`;
  const row = await db.feedSnapshot.findUnique({ where: { key: cacheKey }, select: { payload: true } });
  const cache = (row?.payload ?? {}) as unknown as Record<string, Brief>;

  const missing = sources.filter((s) => s.text.trim() && !cache[s.id]);
  if (missing.length) {
    try {
      const translated = await translate(missing.map((s) => s.text));
      const fresh: Record<string, Brief> = {};
      missing.forEach((s, i) => {
        const t = translated[i];
        if (t) fresh[s.id] = t;
      });
      if (Object.keys(fresh).length) {
        // Newest first, then the rest — so trimming drops the oldest.
        const merged = Object.fromEntries(Object.entries({ ...fresh, ...cache }).slice(0, KEEP));
        const payload = merged as unknown as Prisma.InputJsonValue;
        await db.feedSnapshot.upsert({
          where: { key: cacheKey },
          create: { key: cacheKey, payload, fetchedAt: new Date() },
          update: { payload, fetchedAt: new Date() },
        });
        Object.assign(cache, fresh);
      }
    } catch (error) {
      console.error("[ai-briefs]", error instanceof Error ? error.message : error);
    }
  }

  return Object.fromEntries(sources.filter((s) => cache[s.id]).map((s) => [s.id, cache[s.id]]));
}
