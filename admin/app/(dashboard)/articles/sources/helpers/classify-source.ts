/**
 * تصنيفٌ فوريّ للنطاق بلا أي نداءٍ خارجيّ — الطبقة الأولى من بوّابة المصادر.
 *
 * قِيس ١٦ سبتمبر ٢٠٢٦ على مقالاتنا: ٤٤ نطاقاً من ٨٧ حكوميّ أو تعليميّ أو منظّمة
 * دوليّة. فهذه القائمة وحدها تحسم أكثر الحالات بلا شبكةٍ ولا مفتاح ولا حصّة.
 *
 * والامتدادات المرفوضة ليست تحاملاً على لاحقة: هي حيث تُشترى النطاقات الرخيصة
 * وتُرمى. كل مواقع السبام الّتي وُجدت تربط إلينا كانت `.shop` أو `.store` أو `.xyz`،
 * وأعمارها ٣٥ و٥٨ و٥٩ يوماً.
 */

export type SourceVerdict = "trusted" | "neutral" | "suspect";

export interface Classification {
  verdict: SourceVerdict;
  /** سببٌ يُعرض للمحرّر — لا رمزٌ داخليّ. */
  reason: string;
}

/** لاحقاتٌ لا تُمنح إلا لجهةٍ موثّقة، فحاملها موثوقٌ بحكم اللاحقة. */
const TRUSTED_TLD = /\.(gov|gov\.[a-z]{2}|edu|edu\.[a-z]{2}|int|mil)$/i;

/** نطاقاتٌ بعينها — مراجع عالميّة يعرفها كل محرّر. */
const TRUSTED_HOSTS = [
  "who.int", "emro.who.int", "unicef.org", "unesco.org", "whc.unesco.org",
  "wikipedia.org", "ar.wikipedia.org", "en.wikipedia.org",
  "nih.gov", "ncbi.nlm.nih.gov", "pmc.ncbi.nlm.nih.gov", "medlineplus.gov",
  "mayoclinic.org", "clevelandclinic.org", "my.clevelandclinic.org",
  "health.clevelandclinic.org", "healthline.com", "medicalnewstoday.com",
  "sciencedirect.com", "acog.org", "psychiatry.org", "rsna.org",
  "google.com", "support.google.com", "developers.google.com", "cloud.google.com",
  "microsoft.com", "fifa.com",
];

/**
 * لاحقاتٌ رخيصة تُستعمل في مزارع الروابط. الوجود فيها لا يعني السبام قطعاً —
 * لذلك الحكم «مشبوه» لا «مرفوض»، ويبقى القرار لإنسان.
 */
const SUSPECT_TLD = /\.(shop|store|xyz|top|click|link|buzz|icu|cfd|sbs|rest|bond)$/i;

/** ألفاظٌ تظهر في أسماء نطاقات بيع الروابط. */
const SUSPECT_WORDS = /(backlink|link-?seo|seo-?link|pbn|rank-?boost|linkrank|rankpro|seoexpress|link-?juice|link-?baron|dofollow|guest-?post)/i;

export function classifySource(domain: string): Classification {
  const host = domain.toLowerCase().replace(/^www\./, "");

  if (TRUSTED_TLD.test(host)) {
    return { verdict: "trusted", reason: "نطاقٌ حكوميّ أو تعليميّ" };
  }
  if (TRUSTED_HOSTS.some((h) => host === h || host.endsWith("." + h))) {
    return { verdict: "trusted", reason: "مرجعٌ عالميّ معروف" };
  }
  if (SUSPECT_WORDS.test(host)) {
    return { verdict: "suspect", reason: "اسم النطاق يحمل لفظ بيع روابط" };
  }
  if (SUSPECT_TLD.test(host)) {
    return { verdict: "suspect", reason: "لاحقةٌ رخيصة شائعة في مزارع الروابط" };
  }
  return { verdict: "neutral", reason: "غير مصنَّف — يحتاج فحص العمر" };
}
