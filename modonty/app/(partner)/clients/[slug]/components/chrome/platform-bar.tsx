import { Suspense } from "react";
import Link from "next/link";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { ThemeToggle } from "@/app/layout/components/nav/ThemeToggle";
import { UserMenu } from "@/app/layout/components/user-menu/UserMenu";
import { IconShieldCheck } from "@/lib/icons";
import { CollapseOnScroll } from "./collapse-on-scroll";

interface PlatformBarProps {
  /** True when the partner has papers on file (CR / legal name / verification image). */
  isVerified: boolean;
}

/**
 * The one strip of modonty on a partner site: a way back, the trust mark, your account,
 * the theme. It replaces modonty's full header here — the partner's own header sits
 * right under it. Folds while scrolling down so the partner's chrome owns the screen.
 */
export function PlatformBar({ isVerified }: PlatformBarProps) {
  return (
    <CollapseOnScroll>
      <div className="bg-[#0b0d1f] text-xs text-[#c9ccdf]">
        <div className="mx-auto flex h-9 max-w-[1216px] items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 font-medium text-white hover:text-white/80" aria-label="الرجوع إلى مدونتي">
            <ModontyMark className="h-4 w-4 text-primary" aria-hidden />
            مُدَوَّنَتِي
          </Link>
          {isVerified ? (
            <>
              <span className="h-3 w-px bg-white/20" aria-hidden />
              <span className="flex items-center gap-1">
                <IconShieldCheck className="h-3.5 w-3.5 text-green-500" aria-hidden />
                شريك موثّق
              </span>
              <Link href="/trust" className="hover:text-white">كيف نتأكّد؟</Link>
            </>
          ) : null}
          <span className="ms-auto flex items-center gap-3">
            <Link href="/clients" className="hover:text-white">تصفّح الشركاء</Link>
            <ThemeToggle />
            <Suspense fallback={<span className="inline-block h-8 w-8" aria-hidden />}>
              <UserMenu />
            </Suspense>
          </span>
        </div>
      </div>
    </CollapseOnScroll>
  );
}
