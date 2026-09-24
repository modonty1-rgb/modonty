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
      {/* The trail and title sit in the same `max-w-[1128px] px-6` box as the blocks below them.
          Without it (until 24 Sep 2026) they hugged the viewport edge at 1280px — measured x=0
          while the blocks' own headings started 60px in. */}
      <div className="mx-auto max-w-[1128px] px-6 pt-6">
        <nav aria-label="مسار الصفحة" className="flex items-center gap-1 text-sm text-muted-foreground">
          {/* ٢٤px أدنى هدف في WCAG 2.5.8 — كان ٢٠. فتات الخبز تنقّل ثانوي، فلا تُرفع إلى
            ٤٤ مثل روابط المحتوى، ولا تبقى تحت الحدّ. */}
          <Link href={base} className="inline-flex min-h-6 items-center hover:text-foreground">
            {siteName}
          </Link>
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
      </div>
      <div className="mt-10">{children}</div>
    </div>
  );
}
