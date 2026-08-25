import { Suspense } from "react";
import { messages } from "@/lib/i18n/messages";
import Link from "next/link";
import { FooterCopyright } from "@/app/layout/components/FooterCopyright";
import { FooterStats } from "@/app/layout/components/FooterStats";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { BRAND_AR } from "@/constants";
// `max-lg:min-h-11` — the fingertip floor, on phones and tablets only (Khalid, 22 Aug: mobile
// refactor). These links measured 16px tall on a phone: eighteen targets stacked two to a row,
// each a third of a fingertip, in the one place a lost reader goes looking for a way out.
// A pointer does not need the same room, so the desktop footer keeps its compact rhythm.
// `max-lg:active:text-link`: a thumb has no hover, so the press itself is the only moment
// the link can answer — it takes the hover colour on touch-down (Apple: respond on
// pointer-down, never only on release). Phones only; the desktop footer is unchanged.
const linkClass =
  "inline-flex max-lg:min-h-11 max-lg:min-w-11 max-lg:justify-center items-center gap-1.5 text-xs text-muted-foreground hover:text-link max-lg:active:text-link transition-colors";

function FooterStatsSkeleton() {
  return <div className="w-full h-[76px] rounded-lg bg-primary/80 skeleton-shimmer" aria-hidden />;
}

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t bg-card mt-auto container mx-auto max-w-[1128px] px-4 py-4 flex flex-col items-center gap-4"
    >
      {/* «بالأرقام» — platform stats strip (moved from homepage left sidebar) */}
      <Suspense fallback={<FooterStatsSkeleton />}>
        <FooterStats />
      </Suspense>

      {/* jbr SEO CTA */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">{messages.chrome.footer.ctaQuestion}</span>
        <CtaTrackedLink
          href="https://www.jbrseo.com"
          target="_blank"
          rel="noopener noreferrer"
          label="Footer CTA — جبر SEO"
          type="LINK"
          className="font-semibold text-link hover:underline max-lg:active:underline inline-flex max-lg:min-h-11 items-center gap-0.5"
        >
          {messages.chrome.footer.ctaBrand} <span aria-hidden="true">↗</span>
        </CtaTrackedLink>
      </div>

      {/* Quick links */}
      <nav
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
        aria-label={messages.chrome.footer.quickLinks}
      >
        <Link href="/" className={linkClass}>{messages.chrome.footer.home}</Link>
        <Link href="/trending" className={linkClass}>{messages.chrome.footer.trending}</Link>
        <Link href="/clients" className={linkClass}>{messages.chrome.footer.partners}</Link>
        <Link href="/industries" className={linkClass}>{messages.chrome.footer.industries}</Link>
        <Link href="/categories" className={linkClass}>{messages.chrome.footer.categories}</Link>
        <Link href="/reels" className={linkClass}>{messages.chrome.footer.reels}</Link>
        <Link href="/news" className={linkClass}>{messages.chrome.footer.news}</Link>
        <Link href="/tags" className={linkClass}>{messages.chrome.footer.tags}</Link>
        <Link href="/help" className={linkClass}>{messages.chrome.footer.help}</Link>
        <Link href="/help/faq" className={linkClass}>{messages.chrome.footer.faq}</Link>
        <Link href="/contact" className={linkClass}>{messages.chrome.footer.contact}</Link>
        <Link href="/about" className={linkClass}>{messages.chrome.footer.about} {BRAND_AR}</Link>
      </nav>

      {/* Legal links */}
      <nav
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
        aria-label={messages.chrome.footer.legalLinks}
      >
        <Link href="/trust" className={linkClass}>{messages.chrome.footer.trust}</Link>
        <Link href="/terms" className={linkClass}>{messages.chrome.footer.terms}</Link>
        <Link href="/legal/user-agreement" className={linkClass}>{messages.chrome.footer.userAgreement}</Link>
        <Link href="/legal/privacy-policy" className={linkClass}>{messages.chrome.footer.privacy}</Link>
        <Link href="/legal/cookie-policy" className={linkClass}>{messages.chrome.footer.cookies}</Link>
        <Link href="/legal/copyright-policy" className={linkClass}>{messages.chrome.footer.copyright}</Link>
      </nav>

      <small className="text-xs text-muted-foreground text-center">
        {/* Hard-coded on purpose: reading the clock here is request-time data and
            blocks the whole page from being prerendered. Bump it each new year. */}
        <FooterCopyright year={2026} />
      </small>
    </footer>
  );
}
