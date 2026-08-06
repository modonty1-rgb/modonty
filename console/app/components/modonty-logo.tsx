import Image from "next/image";
import { BRAND_WORDMARK_URL } from "@modonty/database/lib/brand-assets";
import { ar } from "@/lib/ar";

const DEFAULT_SRC = BRAND_WORDMARK_URL;

interface ModontyLogoProps {
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  sizes?: string;
}

export function ModontyLogo({
  alt = ar.logo.alt,
  className = "rounded-xl object-cover",
  wrapperClassName = "relative aspect-[3/1] w-full",
  sizes = "(max-width: 768px) 100vw, 50vw",
}: ModontyLogoProps) {
  return (
    <div className={wrapperClassName}>
      {/* أكبر عنصر فوق الطيّة في صفحة الدخول — يُحمَّل فوراً بدل ما يؤجّله المتصفّح.
          مش `priority`: مهجورة في Next.js 16. ومش `preload`: التوثيق يحذّر منها حين
          يوجد أكثر من مرشّح LCP، والشعار يُرندَر مرّتين (جوّال + مكتب). */}
      <Image
        src={DEFAULT_SRC}
        alt={alt}
        fill
        sizes={sizes}
        loading="eager"
        fetchPriority="high"
        className={className}
      />
    </div>
  );
}
