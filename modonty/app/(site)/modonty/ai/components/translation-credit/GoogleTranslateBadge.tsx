/**
 * «powered by Google Translate», under every list that carries a translated line — Google: «The
 * "powered by Google Translate" graphic must always be displayed adjacent any translation results»,
 * linking to translate.google.com. The official SVGs, unaltered: grey on light, white on dark.
 */
export function GoogleTranslateBadge() {
  return (
    <a href="http://translate.google.com" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block" aria-label="powered by Google Translate">
      {/* eslint-disable-next-line @next/next/no-img-element -- Google's own badge, shown unaltered at its size */}
      <img src="/attribution/google-translate-greyscale.svg" alt="powered by Google Translate" width={176} height={16} className="dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element -- the white version for the dark theme */}
      <img src="/attribution/google-translate-white.svg" alt="" width={176} height={16} className="hidden dark:block" />
    </a>
  );
}
