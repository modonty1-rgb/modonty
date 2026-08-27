"use server";

import { revalidatePath } from "next/cache";
import { regenerateAllStaleJsonLd } from "./jsonld-integrity";
import { sanitizeAllCanonicals } from "@/app/(dashboard)/database/actions/canonical-sanitizer";
import { refreshAllSitemaps } from "./sitemap-freshness";
import { syncHreflangLocales } from "./hreflang-sync";
import { regenerateModontyAuthorSeo } from "./author-seo-repair";

export interface SeoMaintenanceStepResult {
  key: string;
  label: string;
  ok: boolean;
  count: number;
  detail?: string;
}

function fail(key: string, label: string, e: unknown): SeoMaintenanceStepResult {
  return { key, label, ok: false, count: 0, detail: e instanceof Error ? e.message : String(e) };
}

export async function runSeoStepJsonLd(): Promise<SeoMaintenanceStepResult> {
  try {
    const r = await regenerateAllStaleJsonLd();
    return {
      key: "jsonld",
      label: "JSON-LD Regenerated",
      ok: r.failed === 0,
      count: r.successful,
      detail: r.failed > 0 ? `${r.failed} failed` : undefined,
    };
  } catch (e) {
    return fail("jsonld", "JSON-LD Regenerated", e);
  }
}

export async function runSeoStepCanonical(): Promise<SeoMaintenanceStepResult> {
  try {
    // Was `regenerateAllStaleCanonicalUrls` from `seo/actions/canonical-url-sanitizer.ts`.
    // Two sanitizers existed for the same job and this was the lesser one: it wrote seven
    // `canonicalUrl` columns and stopped there — no SEO regeneration, no modonty cache bust.
    // modonty serves the STORED blob, so its "corrections" never reached a single public page,
    // and this step reported them as successes.
    //
    // `sanitizeAllCanonicals` (database/actions) is the one that rebuilds the blob after the
    // column, and as of today it counts a failed rebuild as a failure. One sanitizer, one
    // answer.
    const r = await sanitizeAllCanonicals();
    return {
      key: "canonical",
      label: "Canonical URLs Sanitized",
      ok: r.failed === 0,
      count: r.successful,
      detail: r.failed > 0 ? `${r.failed} failed — ${r.errors[0]?.error ?? ""}` : undefined,
    };
  } catch (e) {
    return fail("canonical", "Canonical URLs Sanitized", e);
  }
}

export async function runSeoStepSitemap(): Promise<SeoMaintenanceStepResult> {
  try {
    const r = await refreshAllSitemaps();
    return {
      key: "sitemap",
      label: "Sitemaps Refreshed (GSC)",
      ok: r.failed === 0,
      count: r.successful,
      detail: r.failed > 0 ? `${r.failed} failed` : undefined,
    };
  } catch (e) {
    return fail("sitemap", "Sitemaps Refreshed (GSC)", e);
  }
}

export async function runSeoStepHreflang(): Promise<SeoMaintenanceStepResult> {
  try {
    const r = await syncHreflangLocales();
    return {
      key: "hreflang",
      label: "hreflang Locales Synced",
      ok: true,
      count: r.added,
      detail: r.added === 0 ? `all ${r.total} present` : `kept ${r.kept}, added ${r.added}`,
    };
  } catch (e) {
    return fail("hreflang", "hreflang Locales Synced", e);
  }
}

export async function runSeoStepAuthor(): Promise<SeoMaintenanceStepResult> {
  try {
    const r = await regenerateModontyAuthorSeo();
    return {
      key: "author",
      label: "Author Identity (Modonty = Organization)",
      ok: r.ok,
      count: r.changed ? 1 : 0,
      detail: r.ok ? (r.changed ? "Person → Organization" : "already Organization") : r.detail,
    };
  } catch (e) {
    return fail("author", "Author Identity", e);
  }
}

export async function revalidateSeoPage(): Promise<void> {
  revalidatePath("/seo");
}
