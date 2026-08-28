/**
 * رموز الأسواق كما هي في `Settings.defaultAlternateLanguages` — مصدرٌ واحد لكل من يسأل
 * «ما الأسواق التي نخدمها؟».
 *
 * العمود يخزّن `[{ hreflang, url? }]`، والمقاييس والمولّدات كانت تكتب القائمة بأيديها
 * (`["ar-SA", "ar-EG"]`)، فإضافة سوق من الأدمن لم تكن تصل إليها: صفحةٌ تخدم تسعة أسواق
 * تُقيَّم على اثنين. الشكل غير المتوقَّع يُتجاهَل بصمت — قائمةٌ ناقصة أهون من قائمةٍ مخترَعة.
 */
export function hreflangCodes(defaultAlternateLanguages: unknown): string[] {
  if (!Array.isArray(defaultAlternateLanguages)) return [];

  const codes = defaultAlternateLanguages
    .map((entry) =>
      entry && typeof entry === "object" && typeof (entry as { hreflang?: unknown }).hreflang === "string"
        ? (entry as { hreflang: string }).hreflang.trim()
        : "",
    )
    // `x-default` ثابت في بروتوكول جوجل لا سوقاً نبيعه — لا يُقاس النقص عليه.
    .filter((code) => code && code.toLowerCase() !== "x-default");

  return [...new Set(codes)];
}
