import type { MediaType } from "@prisma/client";

/**
 * SINGLE SOURCE OF TRUTH for image specs per media role.
 * Mirrors the design-team rules in /guidelines/media. Any size/ratio change
 * lives HERE — the upload cropper, the guidance chips, and the save-time
 * validation all read from this file. Never hardcode a ratio elsewhere.
 */
export interface MediaSpec {
  /** Friendly English label shown in the role selector (admin language = English). */
  label: string;
  /** One-line Arabic helper for the designer (help copy may be Arabic). */
  hint: string;
  /** Target aspect ratio (width / height). null = free (no crop enforced). */
  ratio: number | null;
  /** Human-readable ratio, e.g. "16:9", "6:1", "Free". */
  ratioLabel: string;
  /** Recommended export size in px. null for free roles. */
  width: number | null;
  height: number | null;
  /** Minimum acceptable export size (resolution guard at save time). */
  minWidth: number;
  minHeight: number;
  /** Recommended formats, e.g. "WebP / JPG", "PNG (transparent)". */
  formats: string;
  /** Whether transparency (PNG) is required (logos). */
  transparent: boolean;
  /** Safe-zone / content note shown to the designer. */
  note?: string;
}

/** Ratio match tolerance — absorbs sub-pixel rounding from the cropper. */
export const RATIO_TOLERANCE = 0.02;

export const MEDIA_SPECS: Record<MediaType, MediaSpec> = {
  POST: {
    label: "Article Image",
    hint: "صورة المقال الرئيسية",
    ratio: 16 / 9,
    ratioLabel: "16:9",
    width: 1920,
    height: 1080,
    minWidth: 1280,
    minHeight: 720,
    formats: "WebP / JPG",
    transparent: false,
    note: "العنصر المهم في المنتصف — الأطراف تُقص في القوائم.",
  },
  HERO: {
    label: "Client Cover",
    hint: "غلاف صفحة العميل",
    ratio: 6 / 1,
    ratioLabel: "6:1",
    width: 2400,
    height: 400,
    minWidth: 1800,
    minHeight: 300,
    formats: "WebP / JPG",
    transparent: false,
    note: "لا تضع نصوصاً داخل الصورة — المهم في المنتصف دائماً.",
  },
  LOGO: {
    label: "Client Logo",
    hint: "شعار العميل",
    ratio: 1,
    ratioLabel: "1:1",
    width: 500,
    height: 500,
    minWidth: 256,
    minHeight: 256,
    formats: "PNG (transparent)",
    transparent: true,
    note: "خلفية شفافة — الشعار في المنتصف وحوله مسافة.",
  },
  // Social share image (og:image) — reserved for future use. NOT a designer
  // upload role today (the client og:image is auto-derived from the hero).
  OGIMAGE: {
    label: "OG Image",
    hint: "صورة المشاركة الاجتماعية (og:image)",
    ratio: 1200 / 630,
    ratioLabel: "1.91:1",
    width: 1200,
    height: 630,
    minWidth: 1200,
    minHeight: 630,
    formats: "WebP / JPG",
    transparent: false,
    note: "محجوزة لاستخدام لاحق — لا تُرفع يدويًا.",
  },
  // The client's mini / card image — its OWN media type (clientId + type=CLIENT_MINI),
  // the SAME no-extra-field pattern as GALLERY. Shows in the sidebar slider + article
  // client card. No Client schema field needed — the role/type IS the control.
  CLIENT_MINI: {
    label: "Client Mini",
    hint: "صورة العميل المصغّرة — السلايدر + بطاقة المقال",
    ratio: 1200 / 630,
    ratioLabel: "1.91:1",
    width: 1200,
    height: 630,
    minWidth: 1200,
    minHeight: 630,
    formats: "WebP / JPG",
    transparent: false,
    note: "تظهر في السلايدر وبطاقة المقال.",
  },
  TWITTER_IMAGE: {
    label: "Twitter Card",
    hint: "صورة بطاقة إكس/تويتر",
    ratio: 1200 / 630,
    ratioLabel: "1.91:1",
    width: 1200,
    height: 630,
    minWidth: 1200,
    minHeight: 630,
    formats: "WebP / JPG",
    transparent: false,
    note: "summary_large_image — نفس مقاس OG.",
  },
  GALLERY: {
    label: "Gallery",
    hint: "صور معرض صفحة العميل",
    ratio: null,
    ratioLabel: "Free",
    width: null,
    height: null,
    minWidth: 600,
    minHeight: 400,
    formats: "WebP / JPG",
    transparent: false,
  },
  GENERAL: {
    label: "General",
    hint: "صورة عامة بدون مقاس محدد",
    ratio: null,
    ratioLabel: "Free",
    width: null,
    height: null,
    minWidth: 1,
    minHeight: 1,
    formats: "Any image",
    transparent: false,
  },
};

/**
 * Display order in the upload role selector — most-used first, free roles last.
 * CLIENT_MINI is the client "mini / card" image (1.91:1) the designer uploads
 * (feeds the sidebar slider + article client card). OGIMAGE + TWITTER_IMAGE are
 * EXCLUDED upload roles: the client og:image / Twitter card are auto-derived from
 * the hero, nothing separate to upload. GALLERY is EXCLUDED too — client galleries
 * are managed in the dedicated /client-galleries route, not the general upload.
 */
export const MEDIA_TYPE_ORDER: MediaType[] = [
  "POST",
  "HERO",
  "CLIENT_MINI",
  "LOGO",
  "GENERAL",
];

export function getMediaSpec(type: MediaType): MediaSpec {
  return MEDIA_SPECS[type];
}

/** A role enforces a fixed-ratio crop when it declares a ratio. */
export function requiresCrop(type: MediaType): boolean {
  return MEDIA_SPECS[type].ratio !== null;
}

/** True when the produced image matches the role's ratio (within tolerance). */
export function isRatioValid(type: MediaType, width: number, height: number): boolean {
  const spec = MEDIA_SPECS[type];
  if (spec.ratio === null) return true;
  if (!width || !height) return false;
  return Math.abs(width / height - spec.ratio) <= RATIO_TOLERANCE;
}

/** True when the produced image meets the role's minimum resolution. */
export function isResolutionValid(type: MediaType, width: number, height: number): boolean {
  const spec = MEDIA_SPECS[type];
  return width >= spec.minWidth && height >= spec.minHeight;
}

/** Short spec summary for a guidance chip, e.g. "2400×400 · 6:1 · WebP / JPG". */
export function specSummary(type: MediaType): string {
  const spec = MEDIA_SPECS[type];
  const size = spec.width && spec.height ? `${spec.width}×${spec.height} · ` : "";
  return `${size}${spec.ratioLabel} · ${spec.formats}`;
}

export interface ComplianceResult {
  /** true = the stored image matches its role spec on every checked dimension. */
  ok: boolean;
  /** Short English reasons it fails (admin UI is English). Empty when ok. */
  issues: string[];
}

/**
 * Audit a STORED media row against its role spec — format + ratio + resolution.
 * Pure & synchronous: reads only the DB row (width/height/mimeType/filename),
 * never touches Cloudinary. Runs client-side on every render → a free, automatic
 * "compliant / not" verdict the moment the library opens. Fixing is manual
 * (Edit → Replace runs the locked editor). Free roles enforce format only.
 */
export function checkMediaCompliance(input: {
  type: MediaType;
  mimeType: string;
  filename: string;
  width: number | null;
  height: number | null;
}): ComplianceResult {
  const spec = MEDIA_SPECS[input.type];
  const issues: string[] = [];

  const isWebp = input.mimeType === "image/webp" || /\.webp$/i.test(input.filename);
  const isPng = input.mimeType === "image/png" || /\.png$/i.test(input.filename);

  // Format — the whole site standard is WebP, EXCEPT logos which legitimately
  // stay PNG (transparent). Applies to every role (free roles included).
  if (spec.transparent) {
    if (!isPng && !isWebp) issues.push("Format should be PNG or WebP");
  } else if (!isWebp) {
    issues.push("Format should be WebP");
  }

  // Ratio + resolution — only fixed-ratio roles enforce a size.
  if (spec.ratio !== null) {
    if (!input.width || !input.height) {
      issues.push("Dimensions unknown");
    } else if (!isRatioValid(input.type, input.width, input.height)) {
      issues.push(`Ratio should be ${spec.ratioLabel}`);
    } else if (!isResolutionValid(input.type, input.width, input.height)) {
      issues.push(`Min size ${spec.minWidth}×${spec.minHeight}`);
    }
  }

  return { ok: issues.length === 0, issues };
}
