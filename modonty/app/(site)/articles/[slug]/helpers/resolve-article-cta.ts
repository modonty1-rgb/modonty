import { isWhatsAppUrl } from "./is-whatsapp-url";

interface ResolvedArticleCta {
  mode: "NONE" | "FORM" | "LINK";
  label: string | null;
  url: string | null;
  /** زرُّ المقال نفسه (منتجٌ بعينه) لا زرُّ العميل العامّ — الشريطُ السفليّ يجعله الزرَّ الأوّل. */
  own: boolean;
}

/** نصُّ زرّ المقال حين يترك الكاتبُ النصَّ فارغاً. */
const DEFAULT_ARTICLE_CTA_LABEL = "اطلب الآن";

/**
 * زرُّ المقال قبل زرّ العميل (خالد ٣ أكتوبر ٢٠٢٦ · بطاقة ARTCTA): مقالٌ عن منتجٍ يودّي القارئَ على
 * المنتج نفسه في موقع العميل، لا على صفحته العامّة يدوّر فيها. فارغٌ ← زرُّ العميل كما كان.
 *
 * والرابطُ يحمل علامةَ مدونتي (UTM) كي يرى العميلُ في تحليلاته أنّ الزيارة — والبيعة — جاءت من
 * مقالنا. لا تُلمس معاملاتٌ وضعها العميلُ بنفسه، ولا يُعلَّم رابطُ واتساب (لا تحليلاتَ هناك).
 */
export function resolveArticleCta(article: {
  slug: string;
  ctaUrl?: string | null;
  ctaLabel?: string | null;
  client: { ctaMode: "NONE" | "FORM" | "LINK"; ctaLabel?: string | null; ctaUrl?: string | null } | null;
}): ResolvedArticleCta {
  const own = article.ctaUrl?.trim();
  if (own) {
    return {
      mode: "LINK",
      label: article.ctaLabel?.trim() || DEFAULT_ARTICLE_CTA_LABEL,
      url: withModontyUtm(own, article.slug),
      own: true,
    };
  }
  return {
    mode: article.client?.ctaMode ?? "NONE",
    label: article.client?.ctaLabel ?? null,
    url: article.client?.ctaUrl ?? null,
    own: false,
  };
}

function withModontyUtm(raw: string, slug: string): string {
  try {
    const u = new URL(raw);
    if (isWhatsAppUrl(raw)) return raw;
    if (!u.searchParams.has("utm_source")) {
      u.searchParams.set("utm_source", "modonty");
      u.searchParams.set("utm_medium", "article");
      u.searchParams.set("utm_campaign", slug);
    }
    return u.toString();
  } catch {
    return raw;
  }
}
