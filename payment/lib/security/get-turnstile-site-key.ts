/**
 * مفتاح الموقع — عامٌّ بنصّ توثيق Cloudflare، يُرسل إلى المتصفّح بلا ضرر.
 * فارغاً: الواجهة لا ترسم الودجة أصلاً، والنموذج يظلّ صالحاً للإرسال (بوّابة السيرفر
 * وحدها تقرّر). هكذا يعمل كل شيء على الساندبوكس قبل وصول مفاتيح الحساب.
 */
export function getTurnstileSiteKey(): string {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? process.env.TURNSTILE_SITE_KEY ?? "";
}
