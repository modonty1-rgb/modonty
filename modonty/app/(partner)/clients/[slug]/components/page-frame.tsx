import type { ReactNode } from "react";
import Link from "next/link";
import { IconChevronRight } from "@/lib/icons";

interface PageFrameProps {
  /** Partner name — the trail's first crumb links back to his home page. */
  siteName: string;
  base: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}

/**
 * The frame every inner page of a partner site shares: a one-crumb trail back to his
 * home, the eyebrow + title, and the content. Sub-pages differ only in what they render.
 */
export function PageFrame({ siteName, base, eyebrow, title, intro, children }: PageFrameProps) {
  return (
    <div>
      <nav aria-label="مسار الصفحة" className="flex items-center gap-1 text-sm text-muted-foreground">
        {/* ٢٤px أدنى هدف في WCAG 2.5.8 — كان ٢٠. فتات الخبز تنقّل ثانوي، فلا تُرفع إلى
            ٤٤ مثل روابط المحتوى، ولا تبقى تحت الحدّ. */}
        <Link href={base} className="inline-flex min-h-6 items-center hover:text-foreground">{siteName}</Link>
        <IconChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
        <span className="text-foreground">{title}</span>
      </nav>
      <div className="mt-6">
        {/* حبر الشريك لا لونه الخام: `text-[hsl(var(--primary-ink,var(--primary)))]` هنا كان ٢٫٧٣:١ على السمة الداكنة
            (مقيس ٣١ أغسطس) — نفس علّة روابط الموقع، وهذا العنصر خارج `[data-partner-theme]`
            فما وصله المتغيّر إلا بعد تسميته صراحةً. */}
        <p className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary-ink,var(--primary)))]">
          <span className="h-0.5 w-6 rounded-full bg-accent" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {intro ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{intro}</p> : null}
      </div>
      <div className="mt-10">{children}</div>
    </div>
  );
}
