"use server";

import { revalidatePath } from "next/cache";
import { regenerateAllStaleJsonLd } from "./jsonld-integrity";
import { regenerateAllStaleCanonicalUrls } from "./canonical-url-sanitizer";
import { refreshAllSitemaps } from "./sitemap-freshness";
import { syncHreflangLocales } from "./hreflang-sync";

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
    const r = await regenerateAllStaleCanonicalUrls();
    return {
      key: "canonical",
      label: "Canonical URLs Sanitized",
      ok: r.failed === 0,
      count: r.successful,
      detail: r.failed > 0 ? `${r.failed} failed` : undefined,
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

export async function revalidateSeoPage(): Promise<void> {
  revalidatePath("/seo");
}
