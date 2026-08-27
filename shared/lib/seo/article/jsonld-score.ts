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
import { countReportErrors, countReportWarnings, hasValidatorOutput } from "../client/types";

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

/** Every @type Google's Article documentation recognises, plus the bare parent. */
const ARTICLE_TYPES = ["Article", "NewsArticle", "BlogPosting"];

/**
 * The Article node out of the STORED card — the object Google actually reads.
 *
 * The coverage checks below used to ask the DB row instead ("does the article have an
 * authorId?"), which answers a different question and contradicted this file's own header.
 * A row can hold a featured image while the published card carries no `image` at all —
 * the row-based check called that a pass, and Google saw nothing.
 */
function articleNode(jsonLd: string | null | undefined): Record<string, unknown> | null {
  if (!jsonLd || typeof jsonLd !== "string") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonLd);
  } catch {
    return null;
  }
  const nodes: Record<string, unknown>[] = [];
  const visit = (v: unknown) => {
    if (Array.isArray(v)) return v.forEach(visit);
    if (typeof v !== "object" || v === null) return;
    nodes.push(v as Record<string, unknown>);
    Object.values(v).forEach(visit);
  };
  visit(parsed);
  return (
    nodes.find((n) => {
      const t = n["@type"];
      const names = Array.isArray(t) ? t.map(String) : typeof t === "string" ? [t] : [];
      return names.some((x) => ARTICLE_TYPES.includes(x));
    }) ?? null
  );
}

/** A JSON-LD property counts as emitted when it carries something Google can read. */
const emitted = (node: Record<string, unknown> | null, key: string): boolean => {
  if (!node) return false;
  const v = node[key];
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as object).length > 0;
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
    } else if (!hasValidatorOutput(report)) {
      // Generated but never validated. Not a failure, but we cannot vouch for it — and a
      // stored `{ valid: true }` with no validator section behind it is a claim, not a
      // measurement, so it lands here too instead of collecting the full 60.
      earned = 40;
      status = "warning";
      const reason = report?.uncheckedReason?.trim();
      hint = reason
        ? `ما انفحص — المدقّق ما اشتغل: ${reason}. اضغط «إعادة توليد»`
        : "JSON-LD موجود لكن لم يُتحقّق منه بعد";
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
  //
  // Read off the PUBLISHED card, per this file's header — not off the DB row. Each field
  // still carries its row-side mirror so the hint can name the real problem: a property
  // the row holds but the card never received means the card is stale, and «أعد التوليد»
  // is the fix; a property neither of them holds means the field itself is empty.
  //
  // `dateModified` is the clearest case. `Article.dateModified` is `DateTime @updatedAt`,
  // so Prisma fills it on every write and the row-based check could never once fail — it
  // reported «تاريخ التعديل ✓» on articles that had no card at all.
  const node = articleNode(input.jsonLdStructuredData);
  const required: Array<{ key: string; label: string; inCard: boolean; inRow: boolean }> = [
    { key: "headline", label: "العنوان (headline)", inCard: emitted(node, "headline"), inRow: filled(input.title) },
    { key: "image", label: "الصورة البارزة (image)", inCard: emitted(node, "image"), inRow: filled(input.featuredImageId) },
    { key: "datePublished", label: "تاريخ النشر", inCard: emitted(node, "datePublished"), inRow: filled(input.datePublished) },
    { key: "author", label: "الكاتب (author)", inCard: emitted(node, "author"), inRow: filled(input.authorId) },
  ];
  const recommended: Array<{ key: string; label: string; inCard: boolean; inRow: boolean }> = [
    { key: "dateModified", label: "تاريخ التعديل", inCard: emitted(node, "dateModified"), inRow: filled(input.dateModified) },
    { key: "publisher", label: "الناشر (publisher)", inCard: emitted(node, "publisher"), inRow: filled(input.clientId) },
  ];

  // 28 of the 40 sit on the four Google reads; the two recommended share the other 12.
  const REQ_EACH = 7;
  const REC_EACH = 6;

  const missingHint = (inRow: boolean, tail: string) =>
    !node
      ? "لا توجد بطاقة منظّمة منشورة لفحصها — أعد توليد بيانات المقال"
      : inRow
        ? "موجود في المقال لكنه ما وصل البطاقة المنشورة — أعد التوليد"
        : tail;

  for (const r of required) {
    checks.push({
      key: `jsonld.${r.key}`,
      label: r.label,
      status: r.inCard ? "good" : "error",
      hint: r.inCard ? undefined : missingHint(r.inRow, "حقل تقرأه قوقل فعلاً — بدونه لا نتيجة غنية"),
      earned: r.inCard ? REQ_EACH : 0,
      max: REQ_EACH,
    });
  }
  for (const r of recommended) {
    checks.push({
      key: `jsonld.${r.key}`,
      label: r.label,
      status: r.inCard ? "good" : "warning",
      hint: r.inCard ? undefined : missingHint(r.inRow, "موصى به من قوقل"),
      earned: r.inCard ? REC_EACH : 0,
      max: REC_EACH,
    });
  }

  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  const score = max > 0 ? Math.round((earned / max) * 100) : 0;
  return { score, checks };
}
