// JSON-LD validity + completeness score for an ARTICLE (0–100).
//
// Same two pillars as the client scorer, but Article's schema.org rules are stricter:
//
//  1) STRUCTURAL VALIDITY (60) — does the stored JSON-LD pass the validators we
//     already run (Adobe + Ajv + custom) and cache in `Article.jsonLdValidationReport`?
//     A hard error means Google will not show a rich result, whatever else is filled.
//
//  2) REQUIRED + RECOMMENDED COVERAGE (40) — unlike Organization (which has no required
//     properties), Google's Article documentation names headline, image, datePublished
//     and author as the ones it actually reads. Those are weighted as required here;
//     dateModified and publisher are recommended.
//
// Reads STORED fields only, so the number matches what is really published and is
// identical on every surface. Docs: developers.google.com/search/docs/appearance/structured-data/article

import type { SeoScore, SeoCheck, JsonLdValidationReport } from "../client/types";
import { countReportErrors, countReportWarnings } from "../client/types";

export interface ArticleJsonLdInput {
  jsonLdStructuredData?: string | null;
  jsonLdValidationReport?: JsonLdValidationReport | null;

  // The raw fields that feed the Article JSON-LD. Presence here means the property
  // was emitted — we read the row, not the generated string, for coverage.
  title?: string | null;
  featuredImageId?: string | null;
  datePublished?: Date | string | null;
  dateModified?: Date | string | null;
  authorId?: string | null;
  clientId?: string | null;
  excerpt?: string | null;
  wordCount?: number | null;
}

const filled = (v: unknown): boolean => {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return !Number.isNaN(v) && v > 0;
  return true;
};

/**
 * Compute the article JSON-LD score.
 * Validity 60 (errors are fatal, warnings cost a little) + coverage 40.
 */
export function computeArticleJsonLdScore(input: ArticleJsonLdInput): SeoScore {
  const checks: SeoCheck[] = [];

  // ── 1. Structural validity (60) ────────────────────────────────────────────
  {
    const hasJsonLd = filled(input.jsonLdStructuredData);
    const report = input.jsonLdValidationReport;
    const errors = countReportErrors(report);
    const warnings = countReportWarnings(report);

    let earned = 0;
    let status: SeoCheck["status"] = "error";
    let hint: string | undefined;

    if (!hasJsonLd) {
      hint = "لا يوجد JSON-LD مخزّن — أعد توليد بيانات المقال المنظّمة";
    } else if (!report) {
      // Generated but never validated. Not a failure, but we cannot vouch for it.
      earned = 40;
      status = "warning";
      hint = "JSON-LD موجود لكن لم يُتحقّق منه بعد";
    } else if (errors > 0) {
      earned = 10;
      status = "error";
      hint = `${errors} خطأ في JSON-LD — لن تظهر النتائج الغنية في قوقل`;
    } else if (warnings > 0) {
      earned = 50;
      status = "warning";
      hint = `${warnings} تحذير في JSON-LD`;
    } else {
      earned = 60;
      status = "good";
    }

    checks.push({ key: "jsonld.valid", label: "صحّة JSON-LD", status, hint, earned, max: 60 });
  }

  // ── 2. Coverage of what Google actually reads (40) ─────────────────────────
  // Google's Article docs: headline, image, datePublished, author are the ones it
  // uses. dateModified and publisher are recommended.
  const required: Array<{ key: string; label: string; ok: boolean }> = [
    { key: "headline", label: "العنوان (headline)", ok: filled(input.title) },
    { key: "image", label: "الصورة البارزة (image)", ok: filled(input.featuredImageId) },
    { key: "datePublished", label: "تاريخ النشر", ok: filled(input.datePublished) },
    { key: "author", label: "الكاتب (author)", ok: filled(input.authorId) },
  ];
  const recommended: Array<{ key: string; label: string; ok: boolean }> = [
    { key: "dateModified", label: "تاريخ التعديل", ok: filled(input.dateModified) },
    { key: "publisher", label: "الناشر (publisher)", ok: filled(input.clientId) },
  ];

  // 28 of the 40 sit on the four Google reads; the two recommended share the other 12.
  const REQ_EACH = 7;
  const REC_EACH = 6;

  for (const r of required) {
    checks.push({
      key: `jsonld.${r.key}`,
      label: r.label,
      status: r.ok ? "good" : "error",
      hint: r.ok ? undefined : "حقل تقرأه قوقل فعلاً — بدونه لا نتيجة غنية",
      earned: r.ok ? REQ_EACH : 0,
      max: REQ_EACH,
    });
  }
  for (const r of recommended) {
    checks.push({
      key: `jsonld.${r.key}`,
      label: r.label,
      status: r.ok ? "good" : "warning",
      hint: r.ok ? undefined : "موصى به من قوقل",
      earned: r.ok ? REC_EACH : 0,
      max: REC_EACH,
    });
  }

  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  const score = max > 0 ? Math.round((earned / max) * 100) : 0;
  return { score, checks };
}
