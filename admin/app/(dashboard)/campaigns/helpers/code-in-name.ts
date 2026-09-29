/**
 * هل يحمل اسمُ حملة المنصّة كودَ البريف؟ `B-012` يطابق «B-012» و«b12» و«B-12 | Traffic»…
 * لا «B-0120»: الرقم كاملاً بين حدّين، فلا تُنسب حملةٌ لبريفٍ رقمه جزءٌ من رقمها.
 */
export function codeInName(code: string, name: string): boolean {
  const n = Number(code.replace(/\D/g, ""));
  if (!n) return false;
  return new RegExp(`(^|[^A-Za-z0-9])B-?0*${n}(?![0-9])`, "i").test(name);
}
