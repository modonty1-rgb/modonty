/**
 * زرُّ المقال يودّي على منتج العميل حيث يبيعه (خالد ٣ أكتوبر ٢٠٢٦ · بطاقة ARTCTA).
 *
 * أيُّ رابطٍ صحيح يُقبل — لا نطاقُ العميل وحده (خالد ٣ أكتوبر ٢٠٢٦): «ممكن يكون منتج له في أمازون…
 * في أيّ مكان». المتجرُ يبيع في أمازون ونون وسلّة وموقعه، فقيدُ النطاق كان يرفض روابطَ العميل نفسه.
 * يبقى الفحصُ أنّه رابطٌ حقيقيّ (http/https) — قاعدةٌ واحدة للنموذج والخادم.
 */
export type ArticleCtaCheck = { ok: true; url: string } | { ok: false; error: string };

/** `https://www.Noon.com/x` → `noon.com` · نصٌّ بلا بروتوكول يُقرأ https. */
export function hostOf(raw: string | null | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function checkArticleCtaUrl(raw: string): ArticleCtaCheck {
  const v = raw.trim();
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
  } catch {
    return { ok: false, error: "رابط المنتج غير صحيح — انسخه كاملاً من المتصفّح" };
  }
  if ((u.protocol !== "https:" && u.protocol !== "http:") || !u.hostname.includes(".")) {
    return { ok: false, error: "رابط المنتج غير صحيح — انسخه كاملاً من المتصفّح" };
  }

  return { ok: true, url: u.toString() };
}
