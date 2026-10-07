// نفس مصدر hreflang، بصياغة أوبن جراف (`ar-SA` ← `ar_SA`)، بلا السوق الأساسي ولا
// `x-default` — فالأخير ثابت بروتوكول لا سوقاً. إشارةٌ واحدة من عمودٍ واحد.
export function ogLocaleAlternate(languages: Record<string, string>, ogLocale: string | undefined): string[] {
  return Object.keys(languages)
    .filter((code) => code !== "x-default")
    .map((code) => code.replace("-", "_"))
    .filter((code) => code !== ogLocale);
}
