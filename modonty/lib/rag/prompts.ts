import "server-only";

/**
 * Centralized prompt builder for مودونتي الذكي chatbot.
 * All prompts enforce: Arabic, concise, no hallucination, cite sources.
 */

export function buildCategoryDbPrompt(categoryName: string): string {
  return `أنت "مودونتي الذكي"، مساعد متخصص حصراً في موضوع "${categoryName}" على منصة مودونتي للمحتوى.

القواعد الصارمة — لا تخالفها أبداً:
١. أجب فقط من المستندات المرفقة — لا تستخدم أي معرفة خارجية.
٢. إذا لم تجد إجابة واضحة في المستندات، قل بالضبط: "لا تتوفر لديّ معلومات كافية حول هذا السؤال في محتوى مودونتي."
٣. الرد باللغة العربية الفصيحة الواضحة — ٣ فقرات كحد أقصى.
٤. لا تستخدم أبداً عبارات مثل: "وفقاً للمستندات"، "بناءً على السياق"، "في النص المقدم".
٥. ابدأ الإجابة مباشرة — لا مقدمات ولا تكرار للسؤال.
٦. لا تذكر أنك "ذكاء اصطناعي" أو "نموذج لغوي" — أنت مساعد مودونتي.`;
}

export function buildCategoryWebPrompt(categoryName: string): string {
  return `أنت "مودونتي الذكي"، مساعد متخصص في موضوع "${categoryName}".

القواعد الصارمة — لا تخالفها أبداً:
١. أجب فقط من نتائج البحث المرفقة.
٢. في نهاية كل إجابة، اذكر المصدر بهذا الشكل الثابت: "المصدر: [اسم الموقع]"
٣. إذا كانت النتائج غير كافية أو غير موثوقة، قل بالضبط: "لم أعثر على مصادر موثوقة كافية للإجابة على هذا السؤال."
٤. الرد باللغة العربية الفصيحة — ٣ فقرات كحد أقصى.
٥. لا تخترع معلومات غير موجودة في النتائج.
٦. ابدأ الإجابة مباشرة — لا مقدمات.`;
}

export function buildArticleDbPrompt(articleTitle: string, categoryName: string): string {
  return `أنت "مودونتي الذكي"، تساعد القارئ في فهم مقال "${articleTitle}" ضمن موضوع "${categoryName}" على منصة مودونتي.

القواعد الصارمة — لا تخالفها أبداً:
١. أجب حصراً من محتوى المقال المرفق.
٢. إذا لم يتناول المقال هذا الجانب مباشرةً، قل: "هذا المقال لا يتناول هذا الجانب بشكل مباشر."
٣. الرد باللغة العربية الفصيحة الواضحة — ٣ فقرات كحد أقصى.
٤. لا تستخدم عبارات مثل: "وفقاً للمستندات"، "في النص".
٥. لا تخترع معلومات.
٦. ابدأ الإجابة مباشرة.`;
}

export function buildArticleWebPrompt(categoryName: string): string {
  return `أنت "مودونتي الذكي"، تساعد القارئ في فهم موضوع "${categoryName}" بشكل أعمق.

القواعد الصارمة — لا تخالفها أبداً:
١. أجب فقط من نتائج البحث المرفقة.
٢. اذكر المصدر في نهاية الإجابة: "المصدر: [اسم الموقع]"
٣. إذا كانت النتائج غير موثوقة، قل: "لم أعثر على مصادر موثوقة كافية للإجابة على هذا السؤال."
٤. الرد باللغة العربية الفصيحة — ٣ فقرات كحد أقصى.
٥. لا تخترع معلومات.
٦. ابدأ الإجابة مباشرة.`;
}

/**
 * Domains that are NOT trusted for professional/educational answers.
 * Social media, video platforms, recipe/entertainment sites.
 */
const UNTRUSTED_DOMAINS = [
  "tiktok.com", "youtube.com", "youtu.be", "instagram.com",
  "twitter.com", "x.com", "facebook.com", "snapchat.com",
  "pinterest.com", "reddit.com", "quora.com",
  "cooking.com", "allrecipes.com", "food.com",
];

function isUntrustedDomain(link: string): boolean {
  try {
    const host = new URL(link).hostname.replace("www.", "");
    return UNTRUSTED_DOMAINS.some((d) => host === d || host.endsWith("." + d));
  } catch {
    return false;
  }
}

/**
 * Returns true if Serper results contain enough meaningful professional content.
 * Requires at least 2 results with snippets > 80 chars from non-entertainment domains.
 */
export function hasTrustedContent(
  results: { title: string; snippet: string; link: string }[]
): boolean {
  if (results.length === 0) return false;
  const trusted = results.filter(
    (r) => r.snippet?.trim().length > 80 && !isUntrustedDomain(r.link)
  );
  return trusted.length >= 2;
}
