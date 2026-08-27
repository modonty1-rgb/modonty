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
import { readCanonicalUrl, readRobotsState } from "./types";

// Google best-practice title/description lengths (chars).
const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;
const OG_MIN_W = 1200;
const OG_MIN_H = 630;

/**
 * Google, "Block Search indexing with noindex": «Google will drop that page entirely from
 * Google Search results, regardless of whether other sites link to it.»
 * https://developers.google.com/search/docs/crawling-indexing/block-indexing
 */
const NOINDEX_HINT =
  "صفحة الشريك محجوبة عن الفهرسة (noindex) — قوقل يشيلها من النتائج كلها، فالدرجة صفر حتى يُرفع الحجب";

interface MetaTags {
  title?: unknown;
  description?: unknown;
  canonical?: unknown;
  robots?: unknown;
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
/**
 * The first share image, and — separately — whether its size was ever recorded.
 *
 * `width`/`height` are absent on plenty of stored blobs. Treating an absent number as 0
 * made the check announce «أبعاد الصورة أصغر من 1200×630» about an image nobody measured:
 * a claim, not a reading. `measured` is what tells the two apart.
 */
function firstOgImage(m: MetaTags): { width: number; height: number; measured: boolean } | null {
  const imgs = m.openGraph?.images;
  if (!Array.isArray(imgs) || imgs.length === 0) return null;
  const i = imgs[0] as { url?: unknown; width?: unknown; height?: unknown };
  if (!str(i?.url)) return null;
  const width = typeof i.width === "number" ? i.width : 0;
  const height = typeof i.height === "number" ? i.height : 0;
  return { width, height, measured: width > 0 && height > 0 };
}

/**
 * Does the STORED metadata carry a share image at all? Exactly the rule the OG check
 * below uses, exported so the dashboard's "no share image" count can never disagree
 * with the score that produced it.
 */
export function hasStoredOgImage(nextjsMetadata: unknown): boolean {
  return firstOgImage(asMeta(nextjsMetadata)) !== null;
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
  //
  // Three states, not two: an image whose size was never recorded is «غير مقيس», not small.
  {
    const og = firstOgImage(m);
    let earned = 0;
    let status: SeoCheck["status"] = "error";
    let hint: string | undefined = "أضف صورة مشاركة (1200×630) — شعار أو صورة غلاف";
    if (og && !og.measured) {
      earned = 15; status = "warning";
      hint = "الصورة موجودة لكن مقاسها غير مقيس — أعد توليد الميتا عشان تُسجَّل أبعادها";
    } else if (og) {
      const okDim = og.width >= OG_MIN_W && og.height >= OG_MIN_H;
      if (okDim) { earned = 25; status = "good"; hint = undefined; }
      else { earned = 15; status = "warning"; hint = `أبعاد الصورة ${og.width}×${og.height} أصغر من 1200×630`; }
    }
    checks.push({ key: "ogImage", label: "صورة المشاركة", status, hint, earned, max: 25 });
  }

  // ── Robots (5) — the directive that decides whether any of the above matters ──
  //
  // The header above says platform-provided bits are not scored against the client, and
  // that still holds for siteName/locale/twitterSite. `robots` is different in kind: it is
  // not a nicety the platform fills in, it is the switch that decides whether this partner's
  // page exists in Google at all. It was unscored, so a blocked page read 100/100.
  let blockedFromIndex = false;
  {
    const state = readRobotsState(m.robots);
    blockedFromIndex = state === "noindex";
    checks.push({
      key: "robots",
      label: "توجيه الأرشفة (robots)",
      status: state === "index" ? "good" : state === "noindex" ? "error" : "warning",
      hint:
        state === "index"
          ? undefined
          : state === "noindex"
            ? NOINDEX_HINT
            : "ما فيه robots في الميتا المخزَّنة — غير مقيس، أعد توليد الميتا",
      earned: state === "index" ? 5 : 0,
      max: 5,
    });
  }

  // ── Canonical (10) ──
  {
    const canonical = readCanonicalUrl(m);
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
  const raw = max > 0 ? Math.round((earned / max) * 100) : 0;
  // Google drops a noindex page entirely, so there is no search performance left to grade.
  return { score: blockedFromIndex ? 0 : raw, checks };
}
