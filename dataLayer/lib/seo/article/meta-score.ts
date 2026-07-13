// META validity score for an ARTICLE (0–100). Same contract and the same rules as
// the client scorer (dataLayer/lib/seo/client/meta-score.ts) — this is the sibling
// that file's header promised: "an article scorer will live beside this under
// dataLayer/lib/seo/article/ with the same SeoScore/EntitySeoScore contract."
//
// It reads the STORED `nextjsMetadata` — what is actually published — so the number
// is identical on every surface that shows it. It does NOT re-derive a score from the
// draft form: a form-based score answers "is the editor filled in", a stored-field
// score answers "is the live page correct". Only the second one is worth a column.
//
// Where an article differs from a client:
//   · the title must not be a bare echo of the ARTICLE title (a client echoes its name)
//   · articles carry an OG type of "article" and a published time — both scored

import type { SeoScore, SeoCheck } from "../client/types";

// Google best-practice lengths (chars).
const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;
const OG_MIN_W = 1200;
const OG_MIN_H = 630;

interface MetaTags {
  title?: unknown;
  description?: unknown;
  canonical?: unknown;
  alternates?: { canonical?: unknown; languages?: unknown } | null;
  openGraph?: {
    title?: unknown;
    url?: unknown;
    type?: unknown;
    publishedTime?: unknown;
    images?: Array<{ url?: unknown; width?: unknown; height?: unknown }> | unknown;
  } | null;
  twitter?: { card?: unknown; image?: unknown } | null;
}

export interface ArticleMetaInput {
  /** Stored Next.js Metadata object (Article.nextjsMetadata). */
  nextjsMetadata?: unknown;
  /** Article headline — to detect an SEO title that just echoes it. */
  title?: string | null;
}

function asMeta(v: unknown): MetaTags {
  return v && typeof v === "object" ? (v as MetaTags) : {};
}
function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
function firstOgImage(m: MetaTags): { width: number; height: number } | null {
  const imgs = m.openGraph?.images;
  if (!Array.isArray(imgs) || imgs.length === 0) return null;
  const i = imgs[0] as { url?: unknown; width?: unknown; height?: unknown };
  if (!str(i?.url)) return null;
  return {
    width: typeof i.width === "number" ? i.width : 0,
    height: typeof i.height === "number" ? i.height : 0,
  };
}

/**
 * Compute the article META validity score.
 * Weights (total 100): title 25 · description 25 · OG image 25 ·
 * canonical 10 · hreflang 10 · OG article type + published time 5.
 */
export function computeArticleMetaScore(input: ArticleMetaInput): SeoScore {
  const m = asMeta(input.nextjsMetadata);
  const headline = str(input.title);
  const checks: SeoCheck[] = [];

  // ── Title (25) — present, right length, not a bare echo of the headline ──
  {
    const title = str(m.title) || str(m.openGraph?.title);
    let earned = 0;
    let status: SeoCheck["status"] = "error";
    let hint: string | undefined = "أضف عنوان SEO وصفيّاً (30–60 حرفاً)";
    if (title) {
      const okLen = title.length >= TITLE_MIN && title.length <= TITLE_MAX;
      const isEcho = headline && title.toLowerCase() === headline.toLowerCase();
      if (okLen && !isEcho) {
        earned = 25;
        status = "good";
        hint = undefined;
      } else if (isEcho) {
        earned = 12;
        status = "warning";
        hint = "عنوان SEO = عنوان المقال نفسه — اكتب عنواناً مخصّصاً للبحث";
      } else {
        earned = 15;
        status = "warning";
        hint = title.length < TITLE_MIN ? "العنوان قصير (<30)" : "العنوان طويل (>60) سيُقصّ";
      }
    }
    checks.push({ key: "title", label: "عنوان SEO", status, hint, earned, max: 25 });
  }

  // ── Description (25) — present, right length ──
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

  // ── OG/Share image (25) — present + min dimensions (1200×630) ──
  {
    const og = firstOgImage(m);
    let earned = 0;
    let status: SeoCheck["status"] = "error";
    let hint: string | undefined = "أضف صورة مشاركة (1200×630)";
    if (og) {
      const okDim = og.width >= OG_MIN_W && og.height >= OG_MIN_H;
      if (okDim) {
        earned = 25;
        status = "good";
        hint = undefined;
      } else {
        earned = 15;
        status = "warning";
        hint = "أبعاد الصورة أصغر من 1200×630";
      }
    }
    checks.push({ key: "ogImage", label: "صورة المشاركة", status, hint, earned, max: 25 });
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

  // ── hreflang / languages (10) ──
  {
    const langs = m.alternates?.languages;
    const ok = Boolean(langs && typeof langs === "object" && Object.keys(langs).length > 0);
    checks.push({
      key: "hreflang",
      label: "لغات الصفحة (hreflang)",
      status: ok ? "good" : "warning",
      hint: ok ? undefined : "لا توجد بدائل لغوية",
      earned: ok ? 10 : 0,
      max: 10,
    });
  }

  // ── OG article shape (5) — an article must declare og:type=article + a published time ──
  {
    const isArticle = str(m.openGraph?.type).toLowerCase() === "article";
    const hasTime = Boolean(str(m.openGraph?.publishedTime));
    const ok = isArticle && hasTime;
    checks.push({
      key: "ogArticle",
      label: "نوع OG وتاريخ النشر",
      status: ok ? "good" : "warning",
      hint: ok ? undefined : "og:type يجب أن يكون article مع publishedTime",
      earned: ok ? 5 : isArticle || hasTime ? 3 : 0,
      max: 5,
    });
  }

  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  const score = max > 0 ? Math.round((earned / max) * 100) : 0;
  return { score, checks };
}
