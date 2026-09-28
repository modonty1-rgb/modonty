import type { MediaType, Prisma } from "@prisma/client";

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
  // Sector page heroes (27 Sep 2026) — `SectorPage.heroMedia` / `heroMobileMedia`. The headline and
  // button are live text over the image, never baked in (Arabic in generated images comes out wrong,
  // and Google cannot read it).
  SECTOR_HERO: {
    label: "Sector Hero — Desktop",
    hint: "صورة أعلى صفحة القطاع على الديسكتوب",
    ratio: 8 / 3,
    ratioLabel: "8:3",
    width: 2048,
    height: 768,
    minWidth: 1600,
    minHeight: 600,
    formats: "WebP / JPG",
    transparent: false,
    note: "العنوان والزر يُكتبان فوقها يميناً — اترك النصف الأيمن هادئاً وبلا كتابة.",
  },
  SECTOR_HERO_MOBILE: {
    label: "Sector Hero — Mobile",
    hint: "صورة أعلى صفحة القطاع على الجوّال",
    ratio: 1,
    ratioLabel: "1:1",
    width: 1080,
    height: 1080,
    minWidth: 800,
    minHeight: 800,
    formats: "WebP / JPG",
    transparent: false,
    note: "العنوان والزر يُكتبان فوقها أعلى الصورة — اترك النصف العلوي هادئاً وبلا كتابة.",
  },
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
    label: "Cover — Desktop",
    hint: "غلاف صفحة العميل على الديسكتوب",
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
  // The phone image (26 Sep 2026) — `Client.mobileHeroImageMedia`. Empty = the page falls
  // back to the desktop cover, so this role is optional per client.
  HERO_MOBILE: {
    label: "Cover — Mobile",
    hint: "غلاف صفحة العميل على الجوّال",
    ratio: 2 / 1,
    ratioLabel: "2:1",
    width: 1536,
    height: 768,
    minWidth: 1024,
    minHeight: 512,
    formats: "WebP / PNG (transparent)",
    transparent: true,
    note: "خلفية شفافة — المهم في المنتصف، بلا نصوص داخل الصورة.",
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
  "HERO_MOBILE",
  "CLIENT_MINI",
  "LOGO",
  "GENERAL",
];

/**
 * The roles Clients › Media uploads (Khalid, 26 Sep 2026): one per client page slot, no
 * «General» (that stays in the main library). Gallery keeps its own upload in Client Galleries.
 */
export const CLIENT_UPLOAD_ROLES: MediaType[] = ["HERO", "HERO_MOBILE", "CLIENT_MINI", "LOGO"];

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

/** True when the only thing wrong is the file format — fixable in place by re-encoding. */
export function isFormatIssue(issue: string): boolean {
  return / — should be (PNG or )?WebP$/.test(issue);
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
  // A video (a reel) has no image role: WebP, ratio and resolution are image rules. Checking
  // it here painted every reel red with «Format should be WebP» (26 Sep 2026).
  if (input.mimeType.startsWith("video/")) return { ok: true, issues: [] };

  const spec = MEDIA_SPECS[input.type];
  const issues: string[] = [];

  const isWebp = input.mimeType === "image/webp" || /\.webp$/i.test(input.filename);
  const isPng = input.mimeType === "image/png" || /\.png$/i.test(input.filename);

  // Format — the whole site standard is WebP, EXCEPT logos which legitimately
  // stay PNG (transparent). Applies to every role (free roles included).
  // The message names the current format too («PNG — should be WebP»): «should be WebP»
  // alone left the reader to open the file to learn what it actually was (26 Sep 2026).
  const actual = (input.mimeType.split("/")[1] || input.filename.split(".").pop() || "?").replace("jpeg", "jpg").toUpperCase();
  if (spec.transparent) {
    if (!isPng && !isWebp) issues.push(`${actual} — should be PNG or WebP`);
  } else if (!isWebp) {
    issues.push(`${actual} — should be WebP`);
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

/**
 * `!checkMediaCompliance(row).ok` as a MongoDB aggregation expression — the «Issues» filter
 * runs it inside the database, so finding the triangle files no longer reads every row
 * (28 Sep 2026: that read grew with the library, 0.17 ms per file).
 *
 * The same three rules, read from the same `MEDIA_SPECS` numbers: a video passes; the format
 * (WebP, or PNG for a transparent role); then, for a fixed-ratio role, known dimensions, the
 * ratio within `RATIO_TOLERANCE`, the minimum size. Change a rule above → change it here.
 * `$cond` keeps the division from running on a missing or zero height, as the JS `else if`.
 */
export function mediaIssueExpr(): Prisma.InputJsonObject {
  const matches = (field: string, regex: string, options = "") => ({ $regexMatch: { input: field, regex, options } });
  const isWebp = { $or: [{ $eq: ["$mimeType", "image/webp"] }, matches("$filename", "\\.webp$", "i")] };
  const isPng = { $or: [{ $eq: ["$mimeType", "image/png"] }, matches("$filename", "\\.png$", "i")] };
  const noDims = { $or: [{ $not: ["$width"] }, { $not: ["$height"] }] };

  const failsFor = (spec: MediaSpec) => {
    const badFormat = spec.transparent ? { $and: [{ $not: [isPng] }, { $not: [isWebp] }] } : { $not: [isWebp] };
    if (spec.ratio === null) return badFormat;
    const badRatio = { $gt: [{ $abs: { $subtract: [{ $divide: ["$width", "$height"] }, spec.ratio] } }, RATIO_TOLERANCE] };
    const badSize = { $or: [{ $lt: ["$width", spec.minWidth] }, { $lt: ["$height", spec.minHeight] }] };
    return { $or: [badFormat, { $cond: [noDims, true, { $or: [badRatio, badSize] }] }] };
  };

  return {
    $cond: [
      matches("$mimeType", "^video/"),
      false,
      {
        $switch: {
          branches: (Object.keys(MEDIA_SPECS) as MediaType[]).map((type) => ({ case: { $eq: ["$type", type] }, then: failsFor(MEDIA_SPECS[type]) })),
          default: failsFor(MEDIA_SPECS.GENERAL),
        },
      },
    ],
  };
}
