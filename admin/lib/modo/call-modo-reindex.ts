import "server-only";

import { getModontyBaseUrl } from "@/lib/revalidate-modonty-tag";

export type ModoReindexResult =
  | { ok: true; published: number; due?: number; indexed?: number; chunks?: number; remaining?: number; rateLimited?: boolean }
  | { ok: false; error: string };

/**
 * Asks the site to (re)index articles for Modo — `modonty/app/(site)/modo-chat/api/reindex`.
 * The embeddings live with Modo on the site, so the admin only says WHEN; the same
 * `REVALIDATE_SECRET` it already sends on every publish proves who is asking.
 */
export async function callModoReindex(body: { articleId?: string; dryRun?: boolean; limit?: number }): Promise<ModoReindexResult> {
  const secret = process.env.REVALIDATE_SECRET;
  const base = await getModontyBaseUrl();
  if (!secret || !base) return { ok: false, error: "رابط مدونتي أو السرّ غير مضبوط" };
  try {
    const res = await fetch(`${base}/modo-chat/api/reindex`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, ...body }),
      signal: AbortSignal.timeout(110_000),
    });
    const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok || !json) return { ok: false, error: `مدونتي ردّت ${res.status}` };
    return { ok: true, ...(json as Omit<Extract<ModoReindexResult, { ok: true }>, "ok">) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "تعذّر الوصول لمدونتي" };
  }
}
