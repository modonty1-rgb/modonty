/**
 * Default content-responsibility disclaimer (provisional — a lawyer should review
 * the final wording before production). Shown to clients in the console; they must
 * accept it before saving sensitive data.
 *
 * Lives outside the "use server" actions file because a "use server" module may
 * only export async functions — exporting this constant from there breaks the module.
 */
export const DEFAULT_DISCLAIMER_TEXT =
  "كل ما أزوّد به مُدوّنتي — من بيانات وصور ووثائق وتراخيص وفيديوهات — صحيح وملكي وأملك حق نشره، وأنا المسؤول الوحيد عنه قانونياً. دور مُدوّنتي هو النشر فقط، وهي غير مسؤولة عن صحّته أو مصدره أو قانونيّته.";

export interface DisclaimerSettings {
  text: string;
  version: number;
}
