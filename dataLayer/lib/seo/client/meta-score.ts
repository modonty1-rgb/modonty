// META validity score for a client (0–100). Measures whether the page's meta
// tags are CORRECT for Google + social, per official rules — not just "present".
//
// Sources:
//  - Google Title link: every page a unique, descriptive <title> (truncated by width).
//  - Google snippet/description: unique description per page.
//  - OGP.me: og:title, og:type, og:image, og:url are required for a valid OG object.
//  - Next.js Metadata: openGraph.images, alternates.canonical + languages (hreflang).
//
// Reads the STORED `nextjsMetadata` (what's actually published) so every surface
// shows the same number. Platform-provided bits (siteName/locale/robots/twitterSite)
// come from Settings and are NOT scored against the client.

import type { SeoScore, SeoCheck } from "./types";

// Google best-practice title/description lengths (chars).
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
    images?: Array<{ url?: unknown; width?: unknown; height?: unknown }> | unknown;
  } | null;
  twitter?: { card?: unknown; image?: unknown } | null;
}

export interface ClientMetaInput {
  /** Stored Next.js Metadata object (Client.nextjsMetadata). */
  nextjsMetadata?: unknown;
  /** Client display name — to detect a lazy title that just echoes the name. */
  name?: string | null;
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
 * Compute the client META validity score.
 * Weights (total 100): title 25 · description 25 · OG image 25 ·
 * canonical 10 · hreflang 15.
 */
export function computeClientMetaScore(input: ClientMetaInput): SeoScore {
  const m = asMeta(input.nextjsMetadata);
  const name = str(input.name);
  const checks: SeoCheck[] = [];

  // ── Title (25) — present, right length, not a bare echo of the name ──
  {
    const title = str(m.title) || str(m.openGraph?.title);
    let earned = 0;
    let status: SeoCheck["status"] = "error";
    let hint: string | undefined = "أضف عنوان SEO وصفيّاً (30–60 حرفاً)";
    if (title) {
      const okLen = title.length >= TITLE_MIN && title.length <= TITLE_MAX;
      const isEcho = name && title.toLowerCase() === name.toLowerCase();
      if (okLen && !isEcho) { earned = 25; status = "good"; hint = undefined; }
      else if (isEcho) { earned = 12; status = "warning"; hint = "العنوان = اسم العميل فقط — اجعله وصفيّاً"; }
      else { earned = 15; status = "warning"; hint = title.length < TITLE_MIN ? "العنوان قصير (<30)" : "العنوان طويل (>60) سيُقصّ"; }
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
      if (okLen) { earned = 25; status = "good"; hint = undefined; }
      else { earned = 15; status = "warning"; hint = desc.length < DESC_MIN ? "الوصف قصير (<120)" : "الوصف طويل (>160) سيُقصّ"; }
    }
    checks.push({ key: "description", label: "وصف SEO", status, hint, earned, max: 25 });
  }

  // ── OG/Share image (25) — present + min dimensions (1200×630) ──
  {
    const og = firstOgImage(m);
    let earned = 0;
    let status: SeoCheck["status"] = "error";
    let hint: string | undefined = "أضف صورة مشاركة (1200×630) — شعار أو صورة غلاف";
    if (og) {
      const okDim = og.width >= OG_MIN_W && og.height >= OG_MIN_H;
      if (okDim) { earned = 25; status = "good"; hint = undefined; }
      else { earned = 15; status = "warning"; hint = "أبعاد الصورة أصغر من 1200×630"; }
    }
    checks.push({ key: "ogImage", label: "صورة المشاركة", status, hint, earned, max: 25 });
  }

  // ── Canonical (10) ──
  {
    const canonical = str(m.canonical) || str(m.alternates?.canonical);
    const ok = Boolean(canonical);
    checks.push({
      key: "canonical", label: "الرابط الأساسي (Canonical)",
      status: ok ? "good" : "warning",
      hint: ok ? undefined : "لا يوجد canonical — يُشتق من الرابط عادةً",
      earned: ok ? 10 : 0, max: 10,
    });
  }

  // ── hreflang / languages (15) ──
  {
    const langs = m.alternates?.languages;
    const ok = Boolean(langs && typeof langs === "object" && Object.keys(langs).length > 0);
    checks.push({
      key: "hreflang", label: "لغات الصفحة (hreflang)",
      status: ok ? "good" : "warning",
      hint: ok ? undefined : "حدّد لغات العميل (knowsLanguage) لتوليد hreflang",
      earned: ok ? 15 : 0, max: 15,
    });
  }

  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  const score = max > 0 ? Math.round((earned / max) * 100) : 0;
  return { score, checks };
}
