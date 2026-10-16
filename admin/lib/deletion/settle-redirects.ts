import { db } from "@/lib/db";
import { recordRedirect, type RedirectSection } from "@/lib/redirect/record-redirect";

/**
 * بعد إزالة صفحة (section, slug) — قاعدتا جوجل الرسميّتان:
 *  - لها بديل واضح ← تحويل دائم (308 ≡ 301) من رابطها للبديل، والسلاسل تنطوي (`recordRedirect`).
 *  - بلا بديل ← 410. والتحويلات القديمة التي كانت تصبّ فيها تُحذف، وإلا صار رابطٌ قديم
 *    يحوّل لصفحة محذوفة (تحويل ينتهي بـ410) بدل أن يرجع 410 مباشرة.
 */
export async function settleRedirects(section: RedirectSection, slug: string, toSlug?: string | null): Promise<void> {
  if (toSlug) await recordRedirect(db, section, slug, toSlug);
  else await db.redirect.deleteMany({ where: { section, toSlug: slug } });
}
