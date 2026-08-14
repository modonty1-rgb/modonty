// SEO score for one Media row (0–100). The single source of truth for "how good is
// this image for search", used by the admin media library, the dashboard's Media
// section and its segment pages — the same contract as the article, client and
// reference scorers.
//
// Reads the STORED columns, never a form draft, so every surface shows one number.
//
// Sources:
//  - Google Images best practices: descriptive alt text is the primary signal, and a
//    descriptive filename/URL is a documented ranking factor. Google does NOT use the HTML
//    img `title` attribute, so there is no "title" criterion here.
//  - Schema.org ImageObject: caption / description / width / height. The `name` is composed
//    automatically by the generator (never the media `title` field), so it is never scored.
//  - Accessibility (WCAG 1.1.1): a non-decorative image without alt text is a failure.
//
// Weights (100): alt text 50 · description 20 · dimensions 15 · filename 15.
// Alt text carries half the score on purpose — it is the one field that is both a ranking
// signal and a legal-accessibility requirement, and it is the one actually missing in practice.

export type MediaCheckStatus = "good" | "warning" | "error";

export interface MediaSeoCheck {
  key: string;
  label: string;
  status: MediaCheckStatus;
  hint?: string;
  earned: number;
  max: number;
}

export interface MediaSeoScore {
  score: number;
  checks: MediaSeoCheck[];
}

export interface MediaSeoInput {
  filename?: string | null;
  /** The Cloudinary public_id — the name that actually travels into the indexed URL. */
  cloudinaryPublicId?: string | null;
  altText?: string | null;
  description?: string | null;
  width?: number | null;
  height?: number | null;
  /** The media type — decides whether the 1200×630 share-image rule applies. When omitted the
   *  strict share rule is used, so a share image is never silently over-scored. */
  type?: string | null;
}

// Google truncates long alt text and ignores keyword-stuffed alt text.
const ALT_MIN = 5;
const ALT_MAX = 125;
const DESC_MIN = 50;
const DESC_MAX = 160;
// Below this an image cannot serve as a share image (og:image needs 1200×630).
const DIM_GOOD_W = 1200;
const DIM_GOOD_H = 630;

// Which media types are (or feed) a social share image and therefore need the 1200×630
// Open Graph size. Everything else is a content image, and Google's Image SEO guidance sets
// NO fixed pixel size for those — only "high resolution if possible" + "avoid extreme aspect
// ratios". Verified against this codebase's og:image chain (client page = HERO||LOGO; article
// page = featuredImage(POST)||HERO||LOGO) — GALLERY never feeds og. LOGO is only a last-resort
// og fallback and is square by nature, so it is treated as content, not forced to 1200×630.
const SHARE_IMAGE_TYPES = new Set<string>(["POST", "HERO", "OGIMAGE", "TWITTER_IMAGE", "CLIENT_MINI"]);
// Google: "avoid an extreme aspect ratio" — wider than 3:1 or taller than 1:3 reads as a
// banner/column strip and renders poorly in Google Images.
const EXTREME_ASPECT = 3;

/** Names a camera or a phone gave the file — they say nothing to a search engine. */
const GENERIC_FILENAME = /^(img|dsc|photo|image|untitled|screenshot|snap|whatsapp)[\s_\-.\d]/i;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function computeMediaSeoScore(input: MediaSeoInput): MediaSeoScore {
  const checks: MediaSeoCheck[] = [];

  // ── Alt text (50) — the ranking signal and the accessibility requirement ──
  {
    const alt = str(input.altText);
    let earned = 0;
    let status: MediaCheckStatus = "error";
    let hint: string | undefined = "لا يوجد نص بديل — الصورة لا تظهر في بحث الصور ولا يقرؤها قارئ الشاشة";

    if (alt) {
      if (alt.length >= ALT_MIN && alt.length <= ALT_MAX) {
        earned = 50;
        status = "good";
        hint = undefined;
      } else {
        earned = 30;
        status = "warning";
        hint = alt.length < ALT_MIN ? "النص البديل قصير جداً (<5 أحرف)" : "النص البديل طويل (>125) وسيُقصّ";
      }
    }
    checks.push({ key: "altText", label: "النص البديل", status, hint, earned, max: 50 });
  }

  // ── Dimensions (15) — type-aware. Missing width/height always fails (the browser cannot
  //    reserve space → CLS). Beyond that the bar depends on the role:
  //      • Share images (og:image / twitter card) need 1200×630 (Open Graph spec).
  //      • Content images (gallery / logo / general) follow Google Images: any recorded size
  //        is fine, only an EXTREME aspect ratio is flagged. NO 1200×630 penalty — a client's
  //        gallery photo is never a share image, so judging it by the share size is misleading.
  {
    const w = typeof input.width === "number" ? input.width : 0;
    const h = typeof input.height === "number" ? input.height : 0;
    const type = str(input.type);
    // Omitted type → strict (share) rule, so a share image is never silently over-scored.
    const isShare = type ? SHARE_IMAGE_TYPES.has(type) : true;
    let earned = 0;
    let status: MediaCheckStatus = "error";
    let hint: string | undefined = "أبعاد الصورة غير مسجّلة";

    if (w > 0 && h > 0) {
      if (isShare) {
        if (w >= DIM_GOOD_W && h >= DIM_GOOD_H) {
          earned = 15;
          status = "good";
          hint = undefined;
        } else {
          earned = 9;
          status = "warning";
          hint = `${w}×${h} — أصغر من 1200×630، لا تصلح صورة مشاركة`;
        }
      } else {
        // Content image — Google Images: high resolution + a sane (non-extreme) aspect ratio.
        const ratio = Math.max(w / h, h / w);
        if (ratio > EXTREME_ASPECT) {
          earned = 9;
          status = "warning";
          hint = `${w}×${h} — نسبة الشكل متطرّفة (شريط/عمود)، استخدم نسبة أقرب للطبيعي`;
        } else {
          earned = 15;
          status = "good";
          hint = undefined;
        }
      }
    }
    checks.push({ key: "dimensions", label: "الأبعاد", status, hint, earned, max: 15 });
  }

  // ── Description (20) — Schema.org ImageObject.description / caption ──
  {
    const desc = str(input.description);
    let earned = 0;
    let status: MediaCheckStatus = "warning";
    let hint: string | undefined = "أضف وصفاً (50–160 حرفاً)";

    if (desc) {
      if (desc.length >= DESC_MIN && desc.length <= DESC_MAX) {
        earned = 20;
        status = "good";
        hint = undefined;
      } else {
        earned = 13;
        hint = desc.length < DESC_MIN ? "الوصف قصير (<50)" : "الوصف طويل (>160)";
      }
    }
    checks.push({ key: "description", label: "الوصف", status, hint, earned, max: 20 });
  }

  // ── Filename (15) — the name in the URL Google actually indexes. For a Cloudinary
  //    asset that is the public_id's last segment, NOT the original upload filename.
  {
    const publicId = str(input.cloudinaryPublicId);
    const source = publicId ? publicId.split("/").pop() || publicId : str(input.filename);
    const name = source.toLowerCase();
    let earned = 0;
    let status: MediaCheckStatus = "error";
    let hint: string | undefined = "لا يوجد اسم ملف";

    if (name) {
      const base = name.replace(/\.[a-z0-9]+$/i, "");
      if (GENERIC_FILENAME.test(base)) {
        earned = 6;
        status = "warning";
        hint = "اسم الملف عام (IMG_1234) — سمّه بما يصف الصورة";
      } else if (base.includes(" ")) {
        earned = 8;
        status = "warning";
        hint = "اسم الملف فيه مسافات — استخدم شرطات";
      } else if (base.length < 8) {
        earned = 8;
        status = "warning";
        hint = "اسم الملف قصير — اجعله وصفيّاً";
      } else {
        earned = 15;
        status = "good";
        hint = undefined;
      }
    }
    checks.push({ key: "filename", label: "اسم الملف", status, hint, earned, max: 15 });
  }

  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  return { score: max > 0 ? Math.round((earned / max) * 100) : 0, checks };
}
