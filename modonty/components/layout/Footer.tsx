import Link from "@/components/link";
import Image from "next/image";
import { getOptimizedLogoUrl } from "@/lib/image-utils";
import { FooterCopyright } from "@/components/layout/FooterCopyright";
import pkg from "../../package.json";

const YEAR = 2025;

export function Footer() {
  const logoSrc = getOptimizedLogoUrl();

  return (
    <footer className="border-t bg-card mt-12">
      <div className="container mx-auto max-w-[1128px] px-4 py-4">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Image
              src={logoSrc}
              alt="مودونتي"
              width={90}
              height={50}
              className="object-contain"
            />
            <FooterCopyright appVersion={pkg.version} year={YEAR} />
          </div>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
            aria-label="روابط الفوتر"
          >
            <Link
              href="/legal/user-agreement"
              className="hover:text-primary transition-colors"
            >
              اتفاقية المستخدم
            </Link>
            <Link
              href="/legal/privacy-policy"
              className="hover:text-primary transition-colors"
            >
              سياسة الخصوصية
            </Link>
            <Link
              href="/legal/cookie-policy"
              className="hover:text-primary transition-colors"
            >
              سياسة ملفات تعريف الارتباط
            </Link>
            <Link
              href="/legal/copyright-policy"
              className="hover:text-primary transition-colors"
            >
              سياسة حقوق النشر
            </Link>
            <Link
              href="/help/feedback"
              className="hover:text-primary transition-colors"
            >
              إرسال ملاحظات
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}




