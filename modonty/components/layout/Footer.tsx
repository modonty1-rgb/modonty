import Link from "@/components/link";
import { FooterCopyright } from "@/components/layout/FooterCopyright";
const linkClass =
  "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t bg-card mt-auto container mx-auto max-w-[1128px] px-4 py-4 flex flex-col items-center gap-3"
    >
      {/* jbr SEO CTA */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">هل تريد عملاء من جوجل بلا إعلانات؟</span>
        <a
          href="https://www.jbrseo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
        >
          جبر SEO <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* Quick links */}
      <nav
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
        aria-label="روابط سريعة"
      >
        <Link href="/" className={linkClass}>الرئيسية</Link>
        <Link href="/trending" className={linkClass}>الرائجة</Link>
        <Link href="/clients" className={linkClass}>العملاء</Link>
        <Link href="/tags" className={linkClass}>الوسوم</Link>
        <Link href="/help" className={linkClass}>المساعدة</Link>
        <Link href="/about" className={linkClass}>عن مودونتي</Link>
      </nav>

      {/* Legal links */}
      <nav
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
        aria-label="روابط قانونية"
      >
        <Link href="/terms" className={linkClass}>الشروط والأحكام</Link>
        <Link href="/legal/user-agreement" className={linkClass}>اتفاقية المستخدم</Link>
        <Link href="/legal/privacy-policy" className={linkClass}>سياسة الخصوصية</Link>
        <Link href="/legal/cookie-policy" className={linkClass}>سياسة ملفات تعريف الارتباط</Link>
        <Link href="/legal/copyright-policy" className={linkClass}>سياسة حقوق النشر</Link>
      </nav>

      <small className="text-xs text-muted-foreground text-center">
        <FooterCopyright year={new Date().getFullYear()} />
      </small>
    </footer>
  );
}
