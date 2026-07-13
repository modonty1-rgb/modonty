// Reference-entity SEO score — categories, tags, industries and authors (0–100).
//
// The third scorer in the family, on the same contract as the other two:
//   dataLayer/lib/seo/client/   → clients
//   dataLayer/lib/seo/article/  → articles
//   dataLayer/lib/seo/reference/→ this one
//
// These four models share one shape (name + slug + seoTitle/seoDescription + the
// standard SEO cache: nextjsMetadata, jsonLdStructuredData, jsonLdValidationReport),
// so they share one scorer. They are listing pages, not entities Google shows rich
// results for — the JSON-LD only has to be VALID, there is no "recommended property"
// coverage to chase. That is why the weights differ from the article scorer, and why
// there is no separate file per model.
//
// Like its siblings it reads the STORED, published fields. Never score a form here.

import type { SeoScore, SeoCheck, JsonLdValidationReport } from "../client/types";
import { countReportErrors, countReportWarnings } from "../client/types";

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;

export interface ReferenceSeoInput {
  /** Display name — to catch a title that is a bare echo of it. */
  name?: string | null;
  /** Stored Next.js Metadata object. */
  nextjsMetadata?: unknown;
  jsonLdStructuredData?: string | null;
  jsonLdValidationReport?: JsonLdValidationReport | null;
}

interface MetaTags {
  title?: unknown;
  description?: unknown;
  canonical?: unknown;
  alternates?: { canonical?: unknown; languages?: unknown } | null;
  openGraph?: {
    title?: unknown;
    images?: Array<{ url?: unknown }> | unknown;
  } | null;
}

const asMeta = (v: unknown): MetaTags => (v && typeof v === "object" ? (v as MetaTags) : {});
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/**
 * Weights (total 100):
 *   title 25 · description 25 · OG image 10 · canonical 10 · JSON-LD validity 30.
 *
 * JSON-LD is worth less than on an article because a listing page cannot earn a rich
 * result — it only has to parse cleanly. The copy is worth more, because the title and
 * description ARE the whole search snippet for a page like this.
 */
export function computeReferenceSeoScore(input: ReferenceSeoInput): SeoScore {
  const m = asMeta(input.nextjsMetadata);
  const name = str(input.name);
  const checks: SeoCheck[] = [];

  // ── Title (25) ──
  {
    const title = str(m.title) || str(m.openGraph?.title);
    let earned = 0;
    let status: SeoCheck["status"] = "error";
    let hint: string | undefined = "أضف عنوان SEO وصفيّاً (30–60 حرفاً)";
    if (title) {
      const okLen = title.length >= TITLE_MIN && title.length <= TITLE_MAX;
      const isEcho = name && title.toLowerCase() === name.toLowerCase();
      if (okLen && !isEcho) {
        earned = 25;
        status = "good";
        hint = undefined;
      } else if (isEcho) {
        earned = 12;
        status = "warning";
        hint = "العنوان = الاسم فقط — اجعله وصفيّاً";
      } else {
        earned = 15;
        status = "warning";
        hint = title.length < TITLE_MIN ? "العنوان قصير (<30)" : "العنوان طويل (>60) سيُقصّ";
      }
    }
    checks.push({ key: "title", label: "عنوان SEO", status, hint, earned, max: 25 });
  }

  // ── Description (25) ──
  {
    const desc = str(m.description);
    let earned = 0;
    let status: SeoCheck["status"] = "error";
    let hint: string | undefined = "أضف وصف SEO (120–160 حرفاً)";
    if (desc) {
      const okLen = desc.length >= DESC_MIN && desc.length <= DESC_MAX;
      if (okLen) {
        earned = 25;
        status = "good";
        hint = undefined;
      } else {
        earned = 15;
        status = "warning";
        hint = desc.length < DESC_MIN ? "الوصف قصير (<120)" : "الوصف طويل (>160) سيُقصّ";
      }
    }
    checks.push({ key: "description", label: "وصف SEO", status, hint, earned, max: 25 });
  }

  // ── OG image (10) — presence only; a listing page needs no 1200×630 hero. ──
  {
    const imgs = m.openGraph?.images;
    const ok = Array.isArray(imgs) && imgs.length > 0 && Boolean(str((imgs[0] as { url?: unknown })?.url));
    checks.push({
      key: "ogImage",
      label: "صورة المشاركة",
      status: ok ? "good" : "warning",
      hint: ok ? undefined : "لا توجد صورة مشاركة",
      earned: ok ? 10 : 0,
      max: 10,
    });
  }

  // ── Canonical (10) ──
  {
    const canonical = str(m.canonical) || str(m.alternates?.canonical);
    const ok = Boolean(canonical);
    checks.push({
      key: "canonical",
      label: "الرابط الأساسي (Canonical)",
      status: ok ? "good" : "warning",
      hint: ok ? undefined : "لا يوجد canonical",
      earned: ok ? 10 : 0,
      max: 10,
    });
  }

  // ── JSON-LD validity (30) ──
  {
    const hasJsonLd = Boolean(input.jsonLdStructuredData?.trim());
    const report = input.jsonLdValidationReport;
    const errors = countReportErrors(report);
    const warnings = countReportWarnings(report);

    let earned = 0;
    let status: SeoCheck["status"] = "error";
    let hint: string | undefined = "لا يوجد JSON-LD مخزّن — أعد توليده";

    if (hasJsonLd) {
      if (!report) {
        earned = 20;
        status = "warning";
        hint = "JSON-LD موجود لكن لم يُتحقّق منه بعد";
      } else if (errors > 0) {
        earned = 5;
        status = "error";
        hint = `${errors} خطأ في JSON-LD`;
      } else if (warnings > 0) {
        earned = 25;
        status = "warning";
        hint = `${warnings} تحذير في JSON-LD`;
      } else {
        earned = 30;
        status = "good";
        hint = undefined;
      }
    }
    checks.push({ key: "jsonld.valid", label: "صحّة JSON-LD", status, hint, earned, max: 30 });
  }

  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  const score = max > 0 ? Math.round((earned / max) * 100) : 0;
  return { score, checks };
}
