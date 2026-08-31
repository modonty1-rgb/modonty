import { Suspense } from "react";
import { messages } from "@/lib/i18n/messages";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import Link from "next/link";
import { LogoNav } from "@/app/layout/components/nav/LogoNav";
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
// الماركة لم تعد تُكتب هنا إطلاقاً — لا اسماً ولا رمزاً. `LogoNav` يقرأ الشعار الرسمي
// من الإعدادات، فسقط سبب العطل القديم: أربع تهجئات للاسم وُلدت من كتابته بيدٍ في كل مكوّن.
export async function PlatformBar({ isVerified }: PlatformBarProps) {
  // الخطّ: 12px على الجوّال كان تحت أصغر مقاس مقروء؛ صار 14 هناك و12 على الديسكتوب
  // حيث المسافة إلى العين أقصر.
  return (
      <div className="bg-[#0b0d1f] text-sm text-[#c9ccdf] md:text-xs">
        {/* الارتفاع: كان 44 على الجوّال — وهو الحدّ الأدنى لهدف اللمس لا المريح
            (Apple HIG · Layout: 44×44pt أدنى · Material: 48dp). صار 56 ليتنفّس الصفّ
            ويصله الإصبع بلا تصويب. الديسكتوب يبقى 36. */}
        <div className="mx-auto flex h-9 max-w-[1216px] items-center gap-4 px-4 max-md:h-14">
          {/* الشعار الرسمي لا اسمٌ مكتوب بيد (خالد ٣٠ أغسطس). و`LogoNav` هو المكوّن الذي
              يقرأه من الإعدادات ويضبط مقاسه — فالشريط يستهلكه بدل أن يعيد بناءه، وأي تبديل
              للشعار من الأدمن يصل هنا بلا لمس هذا الملفّ. */}
          <LogoNav className="shrink-0" />
          {isVerified ? (
            <>
              <span className="h-3 w-px bg-white/20" aria-hidden />
              {/* الشارة نفسها هي رابط «كيف نتأكّد؟». كانا عنصرين متجاورين، والمقيس على
                  آيفون (430×932 · DPR 3): ستة عناصر تطلب ≈456px داخل 398 متاحة، فانكسر
                  كل نصّ سطرين داخل شريط ارتفاعه 44. دمجُهما يحذف عنصراً ويبقي المعنى —
                  والشارة كانت أصلاً أوّل ما تقع عليه العين. */}
              <Link
                href="/trust"
                className="flex items-center gap-1 whitespace-nowrap hover:text-white max-md:min-h-11"
                aria-label="شريك موثّق — كيف نتأكّد؟"
              >
                <VerifiedBadge className="h-3.5 w-3.5" label="شريك موثّق" />
                شريك موثّق
              </Link>
            </>
          ) : null}
          <span className="ms-auto flex items-center gap-3">
            {/* من `md` فأعلى: على الجوّال لا مكان له، والزائر يصل قائمة الشركاء من مدونتي نفسها. */}
            <Link href="/clients" className="hidden whitespace-nowrap hover:text-white md:inline">تصفّح الشركاء</Link>
            <ThemeToggle labels={messages.chrome.theme} />
            <Suspense fallback={<span className="inline-block h-8 w-8" aria-hidden />}>
              <UserMenu hint={false} />
            </Suspense>
          </span>
        </div>
      </div>
  );
}
