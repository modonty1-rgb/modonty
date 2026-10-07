

/**
 * Get locale for Open Graph from language
 */
export function getOGLocale(language: string): string {
  const localeMap: Record<string, string> = {
    ar: "ar_SA",
    en: "en_US",
    fr: "fr_FR",
    es: "es_ES",
    de: "de_DE",
  };
  return localeMap[language] || `${language}_${language.toUpperCase()}`;
}
