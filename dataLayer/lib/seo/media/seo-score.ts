// SEO score for one Media row (0–100). The single source of truth for "how good is
// this image for search", used by the admin media library, the dashboard's Media
// section and its segment pages — the same contract as the article, client and
// reference scorers.
//
// Reads the STORED columns, never a form draft, so every surface shows one number.
//
// Sources:
//  - Google Images best practices: descriptive alt text is the primary signal, and a
//    descriptive filename/URL is a documented ranking factor.
//  - Schema.org ImageObject: name / description / width / height.
//  - Accessibility (WCAG 1.1.1): a non-decorative image without alt text is a failure.
//
// Weights (100): alt text 40 · dimensions 15 · title 15 · description 15 · filename 15.
// Alt text carries nearly half the score on purpose — it is the one field that is both
// a ranking signal and a legal-accessibility requirement, and it is the one that is
// actually missing in practice.

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
  altText?: string | null;
  title?: string | null;
  description?: string | null;
  width?: number | null;
  height?: number | null;
}

// Google truncates long alt text and ignores keyword-stuffed alt text.
const ALT_MIN = 5;
const ALT_MAX = 125;
const DESC_MIN = 50;
const DESC_MAX = 160;
// Below this an image cannot serve as a share image (og:image needs 1200×630).
const DIM_GOOD_W = 1200;
const DIM_GOOD_H = 630;

/** Names a camera or a phone gave the file — they say nothing to a search engine. */
const GENERIC_FILENAME = /^(img|dsc|photo|image|untitled|screenshot|snap|whatsapp)[\s_\-.\d]/i;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function computeMediaSeoScore(input: MediaSeoInput): MediaSeoScore {
  const checks: MediaSeoCheck[] = [];

  // ── Alt text (40) — the ranking signal and the accessibility requirement ──
  {
    const alt = str(input.altText);
    let earned = 0;
    let status: MediaCheckStatus = "error";
    let hint: string | undefined = "لا يوجد نص بديل — الصورة لا تظهر في بحث الصور ولا يقرؤها قارئ الشاشة";

    if (alt) {
      if (alt.length >= ALT_MIN && alt.length <= ALT_MAX) {
        earned = 40;
        status = "good";
        hint = undefined;
      } else {
        earned = 24;
        status = "warning";
        hint = alt.length < ALT_MIN ? "النص البديل قصير جداً (<5 أحرف)" : "النص البديل طويل (>125) وسيُقصّ";
      }
    }
    checks.push({ key: "altText", label: "النص البديل", status, hint, earned, max: 40 });
  }

  // ── Dimensions (15) — no width/height means the browser cannot reserve space (CLS),
  //    and the image cannot be used as a share image at all.
  {
    const w = typeof input.width === "number" ? input.width : 0;
    const h = typeof input.height === "number" ? input.height : 0;
    let earned = 0;
    let status: MediaCheckStatus = "error";
    let hint: string | undefined = "أبعاد الصورة غير مسجّلة";

    if (w > 0 && h > 0) {
      if (w >= DIM_GOOD_W && h >= DIM_GOOD_H) {
        earned = 15;
        status = "good";
        hint = undefined;
      } else {
        earned = 9;
        status = "warning";
        hint = `${w}×${h} — أصغر من 1200×630، لا تصلح صورة مشاركة`;
      }
    }
    checks.push({ key: "dimensions", label: "الأبعاد", status, hint, earned, max: 15 });
  }

  // ── Title (15) — Schema.org ImageObject.name ──
  {
    const ok = Boolean(str(input.title));
    checks.push({
      key: "title",
      label: "العنوان",
      status: ok ? "good" : "warning",
      hint: ok ? undefined : "أضف عنواناً — يُستخدم في ImageObject",
      earned: ok ? 15 : 0,
      max: 15,
    });
  }

  // ── Description (15) — Schema.org ImageObject.description ──
  {
    const desc = str(input.description);
    let earned = 0;
    let status: MediaCheckStatus = "warning";
    let hint: string | undefined = "أضف وصفاً (50–160 حرفاً)";

    if (desc) {
      if (desc.length >= DESC_MIN && desc.length <= DESC_MAX) {
        earned = 15;
        status = "good";
        hint = undefined;
      } else {
        earned = 10;
        hint = desc.length < DESC_MIN ? "الوصف قصير (<50)" : "الوصف طويل (>160)";
      }
    }
    checks.push({ key: "description", label: "الوصف", status, hint, earned, max: 15 });
  }

  // ── Filename (15) — the file's own name travels into the URL Google indexes ──
  {
    const name = str(input.filename).toLowerCase();
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
