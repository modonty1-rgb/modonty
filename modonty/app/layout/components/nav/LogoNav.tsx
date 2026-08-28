import Link from "next/link";
import { messages } from "@/lib/i18n/messages";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { ModontyMark } from "@/components/icons/modonty-mark";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";

interface LogoNavProps {
  className?: string;
  /**
   * `mark` — the «M» glyph alone, for the phone bar. The stored logo is a ~4:1 wordmark,
   * and at 24px tall it ate 96px of a 366px row while reading as decoration, not as a
   * home button. The glyph says the same thing in 44px (Khalid, 22 Aug: «use the m letter»).
   */
  variant?: "image" | "mark";
}

// The navbar uses the compact logomark. The full wordmark is reserved for surfaces
// with enough room, such as the publisher sticker in the Home experience.
export async function LogoNav({ className, variant = "image" }: LogoNavProps) {
  // اسم الماركة من الإعدادات لا من ثابت في الكود — هو نفسه الذي يظهر في 
  // وفي عقدة الهوية، فيبقى الظاهر على الشاشة والمُرسَل لجوجل شيئاً واحداً.
  const [{ logoIconUrl, logoUrl }, { siteName }] = await Promise.all([getBrandMedia(), getPageSeoDefaults()]);
  const source = variant === "mark" ? null : logoIconUrl ?? logoUrl;

  return (
    <Link
      href="/"
      className={`inline-flex min-h-11 max-w-full shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-[1.03] ${
        // The glyph is 28px wide; the box is not. Apple's 44pt floor is a WIDTH and a
        // height, and this is the way home — the one target no one should have to aim at.
        variant === "mark" ? "w-11 justify-center motion-safe:active:scale-95" : ""
      }`}
      // اسم الرابط لا يُترك فارغاً لو خلا العمود: «الصفحة الرئيسية» وصفُ وجهةٍ لا اسمُ ماركة.
      aria-label={siteName ? `${siteName} - الصفحة الرئيسية` : "الصفحة الرئيسية"}
    >
      {variant === "mark" ? (
        <ModontyMark className={`size-7 text-primary ${className ?? ""}`} />
      ) : source ? (
        // Fixed HEIGHT, free width. When no compact icon is set, this is the full wordmark
        // (~4:1) — forcing it into a 40×40 square squeezed it to 10px tall and requested
        // a 48px-wide file (measured 2026-08-15). A square icon uploaded later still fits:
        // the browser keeps the natural aspect and only the height is fixed.
        <OptimizedImage
          media={asMedia(source, siteName ?? "")}
          alt={siteName ?? ""}
          width={160}
          height={40}
          // `eager` but NOT high priority. The logo is small and above the fold, so it must not
          // wait for lazy-loading — but it is never the LCP element. Marking it "high" put it in
          // the same first-round queue as the hero image, and the browser then split bandwidth
          // between them (3 high-priority images measured on the homepage, 24 Aug).
          loading="eager"
          sizes="(max-width: 767px) 104px, 160px"
          className={`h-7 w-auto max-w-full object-contain md:h-8 ${className ?? ""}`}
        />
      ) : (
        siteName ? <span className="text-lg font-bold text-link">{siteName}</span> : null
      )}
    </Link>
  );
}
