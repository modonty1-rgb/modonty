import type { ReactNode } from "react";

import { IconChevronRight } from "../../../lib/icons";
import { SiteLink } from "./site-link";

/**
 * The title word of each inner page — «صور مؤسسة X», «تواصل مع X». One list for the live site
 * and the console preview: the preview had no title at all, and two hand-kept copies of page
 * names had already drifted once (4 Oct 2026). «من نحن» has none: its intro carries the h1.
 */
export const PARTNER_PAGE_TITLE_PREFIX = {
  services: "خدمات",
  photos: "صور",
  reviews: "تقييمات",
  articles: "مقالات",
  contact: "تواصل مع",
  faq: "الأسئلة الشائعة لدى",
  book: "احجز مع",
  reels: "ريلز",
} as const;

interface PageFrameProps {
  /** Partner name — the trail's first crumb links back to his home page. */
  siteName: string;
  base: string;
  /** Optional — page-blocks no longer passes «موقع الشريك»: platform wording, not the visitor's (4 Oct 2026). */
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}

/**
 * The frame every inner page of a partner site shares: a one-crumb trail back to his
 * home, the eyebrow + title, and the content. Sub-pages differ only in what they render.
 * In `shared/` since the console preview draws it too (4 Oct 2026).
 */
export function PageFrame({ siteName, base, eyebrow, title, intro, children }: PageFrameProps) {
  return (
    <div>
      {/* The trail and title sit in the same `max-w-[1128px] px-6` box as the blocks below them.
          Without it (until 24 Sep 2026) they hugged the viewport edge at 1280px — measured x=0
          while the blocks' own headings started 60px in. */}
      <div className="mx-auto max-w-[1128px] px-6 pt-6">
        <nav aria-label="مسار الصفحة" className="flex items-center gap-1 text-sm text-muted-foreground">
          {/* ٢٤px على الديسكتوب (WCAG 2.5.8) و٤٤ على الجوّال — معيار صفحة الشريك (٤ أكتوبر ٢٠٢٦):
              مقيس ٤٠px لاسم شريك طويل التفّ سطرين تحت الإبهام. */}
          {/* One line each: with a long partner name both crumbs wrapped to two lines on a phone
              (review, 4 Oct 2026). They truncate; the full title is the h1 right below. */}
          <SiteLink href={base} className="inline-flex min-h-6 min-w-0 max-w-[45%] items-center hover:text-foreground max-lg:min-h-11">
            <span className="truncate">{siteName}</span>
          </SiteLink>
          <IconChevronRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
          <span className="min-w-0 truncate text-foreground">{title}</span>
        </nav>
        <div className="mt-6">
          {/* حبر الشريك لا لونه الخام: كان ٢٫٧٣:١ على السمة الداكنة (مقيس ٣١ أغسطس). */}
          {eyebrow ? (
            <p className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary-ink,var(--primary)))]">
              <span className="h-0.5 w-6 rounded-full bg-accent" aria-hidden />
              {eyebrow}
            </p>
          ) : null}
          {/* بلا tracking-tight: نظام التصميم يُبقي تباعد الحروف العربية عادياً. */}
          {/* 24px on phones (was 30 — a long name made three lines), balanced so no word sits alone. */}
          <h1 className={`${eyebrow ? "mt-2 " : ""}text-balance text-2xl font-bold text-foreground md:text-3xl`}>{title}</h1>
          {intro ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{intro}</p> : null}
        </div>
      </div>
      <div className="mt-10">{children}</div>
    </div>
  );
}
