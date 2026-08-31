import type { HomeData } from "@modonty/shared/components/partner-site/free/home";
import { finalCtaLines } from "@modonty/shared/components/partner-site/free/cta/final-cta";

import { BLOCK_SOURCE, type BlockOwner } from "./block-source";
import { PAGE_BLOCKS } from "./page-blocks";
import { type BlocksPage } from "./page-keys";

/** قسم واحد من صفحة، كما يُعرض في «محتوى الموقع»: بياناته نصّاً، أو أنه ناقص وأين يُملأ. */
export interface BlockView {
  key: string;
  name: string;
  /** لا بيانات له — يُعرض بإطار كهرماني ورابط شاشة الإدخال. */
  empty: boolean;
  /** اسم الشاشة التي تُدخَل منها بياناته، ورابطها (فارغ حين لا يملكها الشريك). */
  where: string;
  href: string;
  /** مَن يملك البيانات — الشريك يُطالَب بها، والأدمن ونصّ مدونتي لا. */
  owner: BlockOwner;
  /** سطور البيانات كما هي في القاعدة — بلا تصميم، هذا هو المطلوب. */
  lines: string[];
  /** عدد العناصر حين يكون القسم قائمة (خدمات · أعضاء · صور…). */
  count?: number;
  /**
   * عناصر القسم كلٌّ في بطاقته حين يكون للعنصر عنوانٌ ووصف (المقالات مثلاً): سطرٌ واحد
   * طويل يخفي الوصف، وبطاقة تُري الشريك ما يقرأه الزائر فعلاً (خالد ٣١ أغسطس).
   */
  items?: { title: string; sub: string | null }[];
  /** صور مصغّرة للقسم المصوَّر — «٢١ صورة» سطرٌ لا يُري الشريك ماذا فيها. */
  thumbs?: string[];
  /** ملاحظة قصيرة: كم يظهر منها هنا، وأين البقيّة — يسأل عنها الشريك وإلا ظنّها ضاعت. */
  note?: string;
}

/**
 * الأقسام التي تعرض عيّنة في الرئيسية لا كل ما فيها. الأعداد مقيسة من المكوّنات نفسها،
 * لا مكتوبة من الذاكرة: `gallery-mosaic.tsx:7` (الشبكة ٨ خانات والأولى تأخذ ٤ → ٥ بالضبط)
 * و`latest-posts.tsx:10`.
 */
/**
 * ما تقصّه الرئيسية، وما يُقصّ في كل مكان. الأعداد مقروءة من المكوّنات سطراً سطراً لا من
 * الذاكرة، والملاحظة لا تظهر إلا حين يتجاوز العدد الحدّ فعلاً — وإلا صارت ضجيجاً.
 *
 * فرقٌ يهمّ الشريك: «عيّنة» يعني الباقي موجود في صفحته · و«قصّ» يعني الباقي **لا يظهر
 * للزائر أبداً**، لأن القسم ما له صفحة تعرضه كاملاً.
 */
const SAMPLE_ON_HOME: Record<string, { cap: number; rest: string }> = {
  gallery: { cap: 5, rest: "«ألبوم أعمالنا»" }, // gallery-mosaic.tsx:7
  blog: { cap: 3, rest: "«مقالاتي»" }, // latest-posts.tsx:10
  faq: { cap: 6, rest: "«الأسئلة الشائعة»" }, // faq-accordion.tsx:15 (HOME_FAQ_LIMIT)
  testimonials: { cap: 3, rest: "«آراء العملاء»" }, // testimonials-grid.tsx:21
  services: { cap: 6, rest: "«خدماتنا»" }, // services-grid.tsx:11
};

/**
 * قصٌّ نهائي: القسم بلا صفحة تعرضه كاملاً، فما زاد عن الحدّ لا يصل الزائر إطلاقاً.
 * فارغٌ اليوم: كان فيه `stats: 4` و`team: 8`، وأُزيل القصّ من المكوّنين نفسيهما
 * (٣١ أغسطس) بدل أن نشرح للشريك لماذا يختفي شغله. يبقى المفهوم هنا لأي قسم يجيء لاحقاً
 * بحدٍّ حقيقي لا مفرّ منه.
 */
const HARD_CAP: Record<string, number> = {};

function noteFor(key: string, page: BlocksPage, count: number | undefined): string | undefined {
  if (count === undefined) return undefined;
  const hard = HARD_CAP[key];
  if (hard !== undefined && count > hard) {
    return `يظهر للزائر ${hard} فقط — و${count - hard} منها ما تظهر في أي صفحة.`;
  }
  if (page !== "home") return undefined;
  const s = SAMPLE_ON_HOME[key];
  if (!s) return undefined;
  // تُقال دائماً لا حين التجاوز فقط (خالد ٣١ أغسطس): الشريك يحتاج يعرف حدّ الرئيسية
  // قبل أن يضيف، لا بعد أن يكتشف أنّ شغله ما ظهر.
  return `الرئيسية تعرض ${s.cap} منها — والباقي في صفحة ${s.rest}.`;
}

/** «٣ صور» لا «٣ عنصر» — العدّ يُقرأ بوحدته أو لا يُقرأ. */
function head(count: number, unit: string): string {
  return `${count} ${unit}`;
}

/**
 * بيانات القسم نصّاً. لا يُستدعى إلا للقسم غير الفارغ — الفراغ يقرّره `isEmpty` في سجلّ
 * المكوّنات نفسه، فلا يختلف ما تعرضه هذه الشاشة عمّا يرسمه الموقع.
 */
function linesFor(
  key: string,
  d: HomeData,
  /** حدّ العرض في هذه الصفحة — موجود في الرئيسية للأقسام المقصوصة، وغائب في صفحة القسم. */
  cap?: number
): {
  lines: string[];
  count?: number;
  items?: { title: string; sub: string | null }[];
  thumbs?: string[];
} {
  switch (key) {
    case "hero":
      return { lines: [d.hero.slogan, d.hero.description, [d.hero.industry, d.hero.city].filter(Boolean).join(" · ")].filter(Boolean) as string[] };
    // «شريك موثَّق في مدونتي» ليس سطر بيانات: ثابتٌ في كل موقع شريك، فيُرسم في الشاشة
    // بشارته لا يُكتب هنا نصّاً (خالد ٣١ أغسطس).
    case "trust":
      return {
        count: d.trust.credentials.length,
        lines: d.trust.credentials.map((c) => [c.name, c.authority, c.year].filter(Boolean).join(" · ")),
      };
    // القسم في الموقع يعرض شيئين لا واحداً (`image-text-about.tsx:14,21`): الوصف، والاسم
    // القانوني كسطر «الكيان». العرض هنا كان يسقط الثاني، فيشوف الشريك أقلّ من الزائر.
    case "about":
      return {
        lines: [
          d.about.description,
          d.about.legalName ? `الكيان: ${d.about.legalName}` : null,
        ].filter(Boolean) as string[],
      };
    case "services":
      return { count: d.services.length, lines: d.services.map((s) => [s.title, s.description].filter(Boolean).join(" — ")) };
    case "stats":
      return { count: d.stats.length, lines: d.stats.map((s) => `${s.value} — ${s.label}`) };
    case "testimonials":
      return { count: d.testimonials.length, lines: d.testimonials.map((t) => `${t.author} · ${t.rating}/5 — ${t.comment}`) };
    // مصغّرات لا سطر عدد: الشريك يشوف صوره فيعرف الناقص والمكرّر بنظرة — وكلّها لا
    // عيّنة منها (خالد ٣١ أغسطس): الصفحة ألبومه، ومراجعته تحتاج الألبوم كاملاً.
    // المصغّرات تطابق ما يراه الزائر في تلك الصفحة: خمسٌ في الرئيسية (`gallery-mosaic.tsx:7`)
    // والألبوم كاملاً في صفحته. `cap` يمرّرها `buildPageView` من جدول الحدود نفسه.
    case "gallery":
      return {
        count: d.gallery.length,
        lines: [],
        thumbs: d.gallery.slice(0, cap ?? d.gallery.length).map((g) => g.url),
      };
    case "team":
      return { count: d.team.length, lines: d.team.map((m) => [m.name, m.role].filter(Boolean).join(" — ")) };
    case "video":
      return { lines: [d.video?.title ?? "فيديو التعريف", d.video?.url ?? ""].filter(Boolean) };
    case "faq":
      return { count: d.faqs.length, lines: d.faqs.map((f) => f.question) };
    case "blog":
      return {
        count: d.posts.length,
        lines: d.posts.map((p) => p.title),
        items: d.posts.map((p) => ({ title: p.title, sub: p.excerpt })),
      };
    case "contact":
      return { lines: [d.phone, d.contact.email, d.contact.address].filter(Boolean) as string[] };
    case "map":
      return { lines: [d.contact.mapHref ?? "الخريطة مضبوطة"] };
    case "booking":
      return { lines: [d.booking.label ?? "زرّ الحجز", d.booking.url].filter(Boolean) as string[] };
    /**
     * أقسام نصّها من مدونتي: لا حقول لها، لكنّها ليست فارغة — الزائر يقرأ فيها كلاماً
     * حقيقياً، فيُعرض كما هو (خالد ٣١ أغسطس: «اعرض البيانات الحقيقية»). نصّ «النداء
     * الأخير» يجيء من مصدره نفسه، فلا تنحرف نسختان.
     */
    case "cta":
      return { lines: finalCtaLines(d.name) };
    case "newsletter":
      return { lines: [`خلّك على تواصل مع ${d.name}`, "بريدك الإلكتروني", "زرّ: اشترك"] };
    case "lead-form":
      return {
        lines: ["اترك رقمك — ونعاود الاتصال بك في نفس اليوم", "اسمك · رقم جوّالك · إيش تحتاج", "زرّ: اطلب اتصالاً"],
      };
    default:
      return { lines: [] };
  }
}

/**
 * أقسام صفحةٍ واحدة بترتيب الزائر، ومعها بياناتها نصّاً أو وسم النقص.
 *
 * عرضٌ لا تحرير (خالد ٣١ أغسطس): الشريك يشوف ما سيصل الزائر فعلاً، والناقص يقوده إلى
 * شاشته. يُحسب على الخادم — `isEmpty` دالّة داخل سجلّ المكوّنات، وتمريرها إلى المتصفّح
 * يجرّ كل مكوّنات الموقع إلى حزمة الكونسول.
 *
 * صفحةٌ واحدة لا التسع: نشتغل الرئيسية أوّلاً ونقفلها، ثم تجي البقيّة.
 */
export function buildPageView(data: HomeData, page: BlocksPage): BlockView[] {
  return PAGE_BLOCKS[page].map((b) => {
    const empty = b.isEmpty(data);
    const cap = page === "home" ? SAMPLE_ON_HOME[b.key]?.cap : undefined;
    const { lines, count, items, thumbs } = empty
      ? { lines: [], count: undefined, items: undefined, thumbs: undefined }
      : linesFor(b.key, data, cap);
    return {
      key: b.key,
      name: b.name,
      empty,
      where: BLOCK_SOURCE[b.key]?.where ?? "محتوى الموقع",
      href: BLOCK_SOURCE[b.key]?.href ?? "/dashboard/page-content",
      owner: BLOCK_SOURCE[b.key]?.owner ?? "client",
      lines,
      count,
      items,
      thumbs,
      note: empty ? undefined : noteFor(b.key, page, count),
    };
  });
}
