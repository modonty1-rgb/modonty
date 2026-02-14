import Link from "@/components/link";
import { FooterCopyright } from "@/components/layout/FooterCopyright";
import { FileText } from "lucide-react";
import pkg from "../../package.json";

const YEAR = 2025;
const linkClass =
  "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t bg-card mt-auto container mx-auto max-w-[1128px] px-4 py-4 flex flex-col items-center gap-3"
    >
      <nav
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
        aria-label="روابط قانونية"
      >
        <Link href="/legal/user-agreement" className={linkClass}>
          اتفاقية المستخدم
        </Link>
        <Link href="/legal/privacy-policy" className={linkClass}>
          سياسة الخصوصية
        </Link>
        <Link href="/legal/cookie-policy" className={linkClass}>
          سياسة ملفات تعريف الارتباط
        </Link>
        <Link href="/legal/copyright-policy" className={linkClass}>
          سياسة حقوق النشر
        </Link>
        <small className="text-xs text-muted-foreground text-center">
        <FooterCopyright appVersion={pkg.version} year={YEAR} />
      </small>
      </nav>
      
    </footer>
  );
}
