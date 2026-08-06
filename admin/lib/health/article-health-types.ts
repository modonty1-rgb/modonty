/**
 * Client-safe half of the article health engine — types and labels only.
 *
 * Deliberately free of `server-only` and of every server import. The engine itself
 * (`article-health.ts`) reaches for the Bunny client and the site-url loader, so a client
 * component importing from it drags those into the browser bundle and the build fails.
 * Keeping the shared vocabulary here lets the UI speak the same language as the engine
 * without importing any of its machinery.
 */

export type HealthCheckId =
  | "featured-image"
  | "featured-crops"
  | "public-url"
  | "body-images"
  | "publisher-logo"
  | "cloudinary-remnant"
  | "seo-drift"
  | "internal-links"
  | "external-links"
  | "citations";

export type HealthSeverity = "critical" | "high" | "low";

/** One failing URL with the answer it gave. */
export interface HealthTarget {
  url: string;
  /** HTTP status, or 0 when the request never completed. */
  httpStatus?: number;
}

export interface HealthIssue {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articleStatus: string;
  /** Whose article it is — the first thing Khalid asks when a problem shows up. */
  clientName: string | null;
  /**
   * The staff editor assigned to this client (`Client.editor`) — who to route the finding
   * to. Explicitly NOT `Article.author`: that relation is the schema.org byline and is
   * pinned to "مُدَوَّنَتِي" on every article, so labelling it "the writer" was wrong.
   * `null` when the client has no editor assigned — better empty than misleading.
   */
  editorName: string | null;
  check: HealthCheckId;
  severity: HealthSeverity;
  /** Arabic, written for the content team — not a stack trace. */
  detail: string;
  /**
   * EVERY failing URL, not just the first. Showing one and hiding the rest forces the
   * writer to guess which link to open — Khalid asked for the whole list (2026-08-04).
   */
  targets: HealthTarget[];
}

/**
 * The published criteria of the report — label, severity, what is measured, and what a
 * failure means in practice.
 *
 * This is the SAME object the criteria dialog renders and the same severities the engine
 * emits, so the explanation shown to a writer can never drift from the rule that judged
 * them. Change a severity here and both the finding and its documentation move together.
 */
export interface HealthCheckInfo {
  label: string;
  severity: HealthSeverity;
  /** What the check actually measures. */
  what: string;
  /** What it means for the reader / for search when it fails. */
  impact: string;
  /**
   * The official rule this check enforces, quoted, plus where to read it.
   * Every criterion was compared against Google Search Central on 2026-08-04; two of them
   * turned out to contradict the documentation and were corrected (5xx is temporary, not
   * dead · 404 and 410 are equivalent). A criterion with no external authority says so.
   */
  basis: { quote: string; source: string } | { quote: null; source: string };
}

export const HEALTH_CHECK_INFO: Record<HealthCheckId, HealthCheckInfo> = {
  "featured-image": {
    label: "صورة المقال الرئيسية",
    severity: "critical",
    what: "نفتح الصورة الكبيرة اللي فوق المقال ونشوف هل تشتغل ولا لا.",
    impact: "الزائر يشوف مربّع فاضي مكان الصورة، وفي قوقل يطلع المقال بلا صورة.",
    basis: {
      quote: "Image URLs must be crawlable and indexable.",
      source: "Google · بيانات المقال المنظّمة",
    },
  },
  "featured-crops": {
    label: "نسخ الصورة بمقاسات مختلفة",
    severity: "critical",
    what: "من كل صورة نسوّي ٣ نسخ بمقاسات مختلفة، ونفحص كل وحدة لحالها.",
    impact: "ممكن الأصل شغّال ووحدة من النسخ ناقصة — وهي اللي تطلع في قوقل ولما أحد يشارك الرابط.",
    basis: {
      quote: "For best results, provide multiple high-resolution images … with these aspect ratios: 16x9, 4x3, and 1x1.",
      source: "Google · بيانات المقال المنظّمة — والمقاسات الثلاثة عندنا مطابقة لها حرفياً",
    },
  },
  "public-url": {
    label: "صفحة المقال",
    severity: "critical",
    what: "نفتح رابط المقال زي ما يفتحه أي زائر. المنشور لازم يشتغل، والمؤرشف لازم ما يفتح، والباقي ما نفحصه لأنه ما نُشر بعد.",
    impact: "مقال مكتوب عندك «منشور» وصفحته ما تفتح — أسوأ شي ممكن يصير، وما فيه شي ثاني يكشفه.",
    basis: {
      quote: "All 4xx errors, except 429, are treated the same … the content doesn't exist.",
      source: "Google · رموز الاستجابة — ولهذا ما نشترط رمز 410 بعينه للمؤرشف، أي 4xx يكفي",
    },
  },
  "body-images": {
    label: "الصور اللي جوّه المقال",
    severity: "high",
    what: "الصور المحطوطة داخل النص نفسه (نفحص أول ١٠ منها).",
    impact: "فراغات بيضا وسط المقال تقطع على القارئ.",
    basis: {
      quote: "Google can find images in the src attribute of <img> elements.",
      source: "Google · صور قوقل — الصورة اللي ما تفتح ما تُفهرَس",
    },
  },
  "publisher-logo": {
    label: "شعار الشركة",
    severity: "high",
    what: "شعار الشركة صاحبة المقال — نفس الشعار اللي نرسله لقوقل.",
    impact: "شعار واحد ما يشتغل، تطلع معلومات كل مقالات هذي الشركة ناقصة مرة وحدة.",
    basis: {
      quote: "The image URL must be crawlable and indexable. The image must be 112x112px, at minimum.",
      source: "Google · بيانات المنظّمة — الشعار خاصية موصى بها لا إلزامية",
    },
  },
  "cloudinary-remnant": {
    label: "صور لسه على الحساب القديم",
    severity: "high",
    what: "هل الصورة اللي توصل للزائر لسه جايّة من حساب الصور القديم؟ (اللي محفوظ في قاعدة البيانات ما نحسبه — نخلّيه عمداً.)",
    impact: "لو وقّفنا الحساب القديم، الصورة تنكسر على طول.",
    basis: {
      quote: null,
      source: "قاعدة داخلية — قرار الانسحاب من الحساب القديم. ما لها مصدر خارجي، وهذا مذكور عمداً",
    },
  },
  "seo-drift": {
    label: "معلومات قديمة عند قوقل",
    severity: "high",
    what: "المعلومات اللي أرسلناها لقوقل — هل لسه تشير لنفس صورة المقال الحالية؟",
    impact: "قوقل يعرض صورة قديمة. يصير بالسكوت لما تبدّل الصورة وما تعيد إرسال المعلومات.",
    basis: {
      quote: "Images must represent the marked up content.",
      source: "Google · بيانات المقال المنظّمة",
    },
  },
  "internal-links": {
    label: "روابط لصفحاتنا",
    severity: "high",
    what: "الروابط اللي جوّه المقال وتوديك لصفحة ثانية عندنا.",
    impact: "رابط ما يفتح = خلل عندنا إحنا، وكمان يضيّع قوّة الربط بين مقالاتك.",
    basis: {
      quote: "Every page you care about should have a link from at least one other page on your site.",
      source: "Google · الروابط القابلة للزحف",
    },
  },
  citations: {
    label: "المصادر",
    severity: "high",
    what: "روابط المصادر المسجّلة للمقال — وهي اللي يقرأها قوقل كدليل على كلامك.",
    impact: "مصدر ما يفتح يضعّف المعلومة اللي بنى عليها المقال.",
    basis: {
      quote: null,
      source: "قاعدة داخلية + schema.org citation — قوقل ما نصّ على أن المصدر الميت يضرّ، فالدرجة اجتهاد تحريري",
    },
  },
  "external-links": {
    label: "روابط لمواقع ثانية",
    severity: "low",
    what: "الروابط اللي جوّه المقال وتوديك لمواقع مو حقّنا.",
    impact: "الموقع الثاني شال الصفحة بعد النشر — يحتاج رابط بديل، ومو خلل في نظامنا.",
    basis: {
      quote: null,
      source: "قوقل ما قال إن الربط بصفحة معطّلة يضرّ الصفحة الرابطة — ولهذا درجتها «بسيط» لا أكثر",
    },
  },
};

/** Arabic label per check — one source for the UI. */
export const HEALTH_CHECK_LABEL: Record<HealthCheckId, string> = Object.fromEntries(
  Object.entries(HEALTH_CHECK_INFO).map(([id, info]) => [id, info.label])
) as Record<HealthCheckId, string>;

export const SEVERITY_LABEL: Record<HealthSeverity, string> = {
  critical: "خطير",
  high: "مهم",
  low: "بسيط",
};

/** What each level means, in the report's own terms. */
export const SEVERITY_MEANING: Record<HealthSeverity, string> = {
  critical: "الزائر أو قوقل يشوفه الحين — لازم يتصلّح على طول.",
  high: "ما يبان للزائر مباشرة، بس يخلّي معلوماتك عند قوقل ناقصة أو يكسر جزء من المقال.",
  low: "سببه موقع ثاني مو بيدنا — يحتاج مراجعة، مو استعجال.",
};
