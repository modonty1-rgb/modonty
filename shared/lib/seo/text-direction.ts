/**
 * Writing direction for a BCP-47 language tag.
 *
 * `<html dir>` used to be the literal `"rtl"` in modonty's root layout while `lang` was read
 * from Settings. The two describe the same thing, so an admin switching Content Language to
 * English would have produced `lang="en" dir="rtl"` — English text laid out right-to-left,
 * with every `ps-`/`pe-` utility in the app mirrored the wrong way. Direction is not a
 * separate decision; it follows the language, so it is derived rather than stored.
 *
 * The list is the right-to-left scripts, matched on the PRIMARY subtag only: `ar`, `ar-SA`
 * and `ar-EG` are one language for this purpose. Anything unrecognised is left-to-right,
 * which is the safe default — a Latin page laid out LTR reads correctly, while an Arabic page
 * laid out LTR is merely ugly, and neither is as broken as the reverse.
 */
const RTL_LANGUAGES = new Set([
  "ar", // Arabic
  "he", // Hebrew
  "fa", // Persian
  "ur", // Urdu
  "ps", // Pashto
  "sd", // Sindhi
  "ug", // Uyghur
  "yi", // Yiddish
  "dv", // Divehi
  "ckb", // Central Kurdish
]);

export type TextDirection = "rtl" | "ltr";

export function textDirection(language: string | null | undefined): TextDirection {
  const primary = (language ?? "").trim().toLowerCase().split(/[-_]/)[0];
  return RTL_LANGUAGES.has(primary) ? "rtl" : "ltr";
}
