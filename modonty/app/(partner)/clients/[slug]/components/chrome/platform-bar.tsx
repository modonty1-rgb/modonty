import { Suspense } from "react";
import { messages } from "@/lib/i18n/messages";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import Link from "next/link";
import { LogoNav } from "@/app/layout/components/nav/LogoNav";
import { ThemeToggle } from "@/app/layout/components/nav/ThemeToggle";
import { UserMenu } from "@/app/layout/components/user-menu/UserMenu";
import { PlatformBarActionsIsland } from "./platform-bar-actions-island";

interface PlatformBarProps {
  /** True when the partner has papers on file (CR / legal name / verification image). */
  isVerified: boolean;
  /** For follow and share — the reader's actions on this partner. */
  clientSlug: string;
}

/**
 * The one strip of modonty on a partner site: a way back, the trust mark, your account,
 * the theme. It replaces modonty's full header here — the partner's own header sits
 * right under it; StickyChrome slides both up on scroll so the partner's chrome owns the screen.
 */
// الماركة لم تعد تُكتب هنا إطلاقاً — لا اسماً ولا رمزاً. `LogoNav` يقرأ الشعار الرسمي
// من الإعدادات، فسقط سبب العطل القديم: أربع تهجئات للاسم وُلدت من كتابته بيدٍ في كل مكوّن.
export async function PlatformBar({ isVerified, clientSlug }: PlatformBarProps) {
  // الخطّ: 12px على الجوّال كان تحت أصغر مقاس مقروء؛ صار 14 هناك و12 على الديسكتوب
  // حيث المسافة إلى العين أقصر.
  return (
      <div className="bg-[#0b0d1f] text-sm text-[#c9ccdf] lg:text-xs">
        {/* الارتفاع: كان 44 على الجوّال — وهو الحدّ الأدنى لهدف اللمس لا المريح
            (Apple HIG · Layout: 44×44pt أدنى · Material: 48dp). صار 56 ليتنفّس الصفّ
            ويصله الإصبع بلا تصويب. الديسكتوب يبقى 36.
            المسافات على الجوّال ضاقت (٤ أكتوبر): مقيس على ٣٦٠ — الشعار ١١٦ + الشارة ١٤ +
            الأزرار ١٨٢ + فراغات ٤٨ + حشو ٣٢ = ٣٩٢، فخرج الشريط ٣٢px عن الشاشة. */}
        <div className="mx-auto flex h-9 max-w-[1216px] items-center gap-4 px-4 max-md:h-14 max-md:gap-2">
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
                className="relative flex min-h-6 items-center gap-1 whitespace-nowrap hover:text-white max-lg:min-h-11 max-md:after:absolute max-md:after:left-1/2 max-md:after:top-1/2 max-md:after:size-11 max-md:after:-translate-x-1/2 max-md:after:-translate-y-1/2 max-md:after:content-['']"
                aria-label="شريك موثّق — كيف نتأكّد؟"
              >
                <VerifiedBadge className="h-4 w-4" label="شريك موثّق" />
                {/* Badge alone on the phone — the words cost the room follow/share need. */}
                <span className="max-md:sr-only">شريك موثّق</span>
              </Link>
            </>
          ) : null}
          <span className="ms-auto flex items-center gap-1 md:gap-3">
            {/* Same size as the two phone icons / desktop buttons, so nothing shifts when it lands. */}
            <Suspense fallback={<span className="inline-block h-7 w-[150px] max-md:h-9 max-md:w-[78px]" aria-hidden />}>
              <PlatformBarActionsIsland clientSlug={clientSlug} />
            </Suspense>
            {/* من `md` فأعلى: على الجوّال لا مكان له، والزائر يصل قائمة الشركاء من مدونتي نفسها. */}
            <Link href="/clients" className="hidden whitespace-nowrap hover:text-white lg:inline-flex lg:min-h-6 lg:items-center">تصفّح الشركاء</Link>
            <ThemeToggle labels={messages.chrome.theme} />
            {/* The guest «دخول» button paints its own light surface but inherits the bar's #c9ccdf
                text — 1.43:1 on 13 partner pages (9 Oct audit). Reset the text to the page colour
                for this control only; the bar's own links keep their light text. */}
            <span className="contents text-foreground">
              <Suspense fallback={<span className="inline-block h-8 w-8" aria-hidden />}>
                <UserMenu hint={false} />
              </Suspense>
            </span>
          </span>
        </div>
      </div>
  );
}
