/**
 * Thrown when neither the DB nor the environment names the site's base URL.
 *
 * There used to be a literal `https://www.modonty.com` standing in for this in nine SEO
 * writers. It read as a safety net and behaved as the opposite: the value becomes canonical,
 * hreflang and every JSON-LD `@id` in the stored blob, so a blank Settings row silently
 * published a host nobody chose while the screen said "saved". Absence must stay absence.
 *
 * Lives in `shared/` because both the admin generators and the shared JSON-LD builders throw
 * it, and free of any DB import so a builder can throw it without pulling Prisma into its
 * module graph.
 */
export class SiteUrlMissingError extends Error {
  constructor() {
    super(
      "رابط الموقع غير محدَّد. الحقل الناقص: Settings.siteUrl — اضبطه من /settings (تبويب الموقع)، " +
        "أو اضبط NEXT_PUBLIC_SITE_URL في بيئة النشر. بدونه تُكتب روابط canonical و hreflang " +
        "والبيانات المنظّمة على مضيف مخترَع.",
    );
    this.name = "SiteUrlMissingError";
  }
}
