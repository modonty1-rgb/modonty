import { Suspense } from "react";
import { messages } from "@/lib/i18n/messages";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import Link from "next/link";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { ThemeToggle } from "@/app/layout/components/nav/ThemeToggle";
import { UserMenu } from "@/app/layout/components/user-menu/UserMenu";

interface PlatformBarProps {
  /** True when the partner has papers on file (CR / legal name / verification image). */
  isVerified: boolean;
}

/**
 * The one strip of modonty on a partner site: a way back, the trust mark, your account,
 * the theme. It replaces modonty's full header here — the partner's own header sits
 * right under it; StickyChrome slides both up on scroll so the partner's chrome owns the screen.
 */
// اسم الموقع من الإعدادات: شريط الشريك كان يعرض «مُدَوَّنَتِي» بالتشكيل الكامل — تهجئة
// رابعة للماركة على شاشة واحدة، ولّدتها كتابة الاسم بيدٍ في كل مكوّن.
export async function PlatformBar({ isVerified }: PlatformBarProps) {
  const { siteName } = await getPageSeoDefaults();

  return (
      <div className="bg-[#0b0d1f] text-xs text-[#c9ccdf]">
        <div className="mx-auto flex h-9 max-w-[1216px] items-center gap-4 px-4 max-md:h-11">
          <Link href="/" className="flex items-center gap-2 font-medium text-white hover:text-white/80 max-md:min-h-11" aria-label={siteName ? `الرجوع إلى ${siteName}` : "الرجوع إلى الرئيسية"}>
            <ModontyMark className="h-4 w-4 text-primary" aria-hidden />
            {siteName}
          </Link>
          {isVerified ? (
            <>
              <span className="h-3 w-px bg-white/20" aria-hidden />
              <span className="flex items-center gap-1">
                <VerifiedBadge className="h-3.5 w-3.5" label="شريك موثّق" />
                شريك موثّق
              </span>
              <Link href="/trust" className="hover:text-white max-md:inline-flex max-md:min-h-11 max-md:min-w-11 max-md:items-center max-md:justify-center">كيف نتأكّد؟</Link>
            </>
          ) : null}
          <span className="ms-auto flex items-center gap-3">
            <Link href="/clients" className="hover:text-white max-md:inline-flex max-md:min-h-11 max-md:min-w-11 max-md:items-center max-md:justify-center">تصفّح الشركاء</Link>
            <ThemeToggle labels={messages.chrome.theme} />
            <Suspense fallback={<span className="inline-block h-8 w-8" aria-hidden />}>
              <UserMenu hint={false} />
            </Suspense>
          </span>
        </div>
      </div>
  );
}
