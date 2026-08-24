import Link from "next/link";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RelativeTime } from "@/components/date/RelativeTime";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import { IconChevronLeft } from "@/lib/icons";
import type { SocialLink } from "@/lib/settings/get-platform-social-links";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, IconComponent> = {
  facebook: SocialFacebookOutline,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  instagram: Instagram,
  tiktok: TiktokLogoLight,
  snapchat: RoundSnapchat,
};

interface ArticleFooterProps {
  client: {
    name: string;
    slug: string;
  };
  /** Who wrote it — modonty's own byline, not the partner who reviewed it. */
  author?: {
    name: string;
    slug: string | null;
    image: string | null;
    jobTitle: string | null;
    linkedIn: string | null;
    twitter: string | null;
    facebook: string | null;
  } | null;
  platformSocialLinks?: SocialLink[];
  dateModified: Date | null;
  lastReviewed: Date | null;
  contentDepth: string | null;
  license: string | null;
}

/**
 * Everything a reader asks about an article once they have finished it: who published it, who
 * wrote it, when it was last checked.
 *
 * It used to be two blocks — a bordered «عن الكاتب» card, then this footer — and both carried
 * the reviewer and the review date. Khalid, 19 Aug: one block, two columns. The facts sit on
 * one side, the byline on the other, and the footer's empty half is finally doing work.
 */
export function ArticleFooter({
  client,
  author,
  platformSocialLinks = [],
  dateModified,
  lastReviewed,
  contentDepth,
  license,
}: ArticleFooterProps) {
  const authorSocial = [
    author?.linkedIn ? { key: "linkedin", href: author.linkedIn, label: "لينكد إن الكاتب", icon: Linkedin } : null,
    author?.twitter ? { key: "twitter", href: author.twitter, label: "إكس الكاتب", icon: Twitter } : null,
    author?.facebook ? { key: "facebook", href: author.facebook, label: "فيسبوك الكاتب", icon: SocialFacebookOutline } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <footer className="my-8 border-t pt-6 md:my-12 md:pt-8">
      <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
        {/* Who wrote it */}
        {author && (
          <section aria-labelledby="article-author-heading">
            <h2 id="article-author-heading" className="mb-3 text-xs font-semibold text-muted-foreground">
              عن الكاتب
            </h2>
            <div className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0 ring-2 ring-primary/20">
                <AvatarImage src={author.image ?? undefined} alt={author.name} />
                <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                  {author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                {author.slug ? (
                  <Link
                    href={`/authors/${author.slug}`}
                    className="block truncate text-sm font-semibold text-link hover:underline max-lg:flex max-lg:min-h-11 max-lg:items-center max-lg:active:underline"
                  >
                    {author.name}
                  </Link>
                ) : (
                  <span className="block truncate text-sm font-semibold">{author.name}</span>
                )}
                {author.jobTitle && (
                  <p className="truncate text-xs text-muted-foreground">{author.jobTitle}</p>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <nav className="flex flex-wrap gap-0.5" aria-label="تابعنا على وسائل التواصل">
                {[...authorSocial, ...platformSocialLinks.map((s) => ({ ...s, icon: ICON_MAP[s.key] }))].map(
                  ({ key, href, label, icon: Icon }) =>
                    Icon ? (
                      <Link
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        /* 44, not the 26 that `p-1.5` around a 14px glyph produced — a fingertip
                           is 44 and these sit shoulder to shoulder, so the miss lands on the
                           neighbour. Measured 19 Aug. */
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
                      >
                        <Icon className="size-4" aria-hidden />
                      </Link>
                    ) : null,
                )}
              </nav>
              {author.slug && (
                <Link
                  href={`/authors/${author.slug}`}
                  className="inline-flex max-lg:min-h-11 shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-muted/50"
                >
                  صفحة الكاتب
                  <IconChevronLeft className="size-3 ltr:rotate-180" aria-hidden />
                </Link>
              )}
            </div>
          </section>
        )}

        {/* When and under what terms. Label on the start edge, value on the end edge, so the
            values line up under each other and are read as a column, not as five sentences. */}
        <dl className="self-start">
          <Row label="نشر بواسطة">
            {/* 171×17 measured on a phone, 24 Aug — a third of a fingertip. An invisible `after:`
                overlay was tried first and did NOT work: the `<dd>` carries `truncate`, so
                `overflow: hidden` clips any patch taller than the row. Growing the link itself is
                the only thing the clip cannot defeat — same `max-lg:flex max-lg:min-h-11` this
                file already uses above. Phone only; the desktop table keeps its 17px rhythm. */}
            <Link
              href={`/clients/${client.slug}`}
              className="font-medium text-link hover:underline max-lg:flex max-lg:min-h-11 max-lg:items-center"
            >
              {client.name}
            </Link>
          </Row>
          {dateModified && (
            <Row label="آخر تحديث">
              <RelativeTime date={dateModified} />
            </Row>
          )}
          {lastReviewed && (
            <Row label="آخر مراجعة">
              <RelativeTime date={lastReviewed} />
            </Row>
          )}
          {contentDepth && <Row label="عمق المحتوى">{contentDepth}</Row>}
          {license && (
            <Row label="الرخصة">
              {license.startsWith("http") ? (
                /* The raw URL used to be printed in full — a line of latin characters in an
                   Arabic footer, and nothing a reader needs to read. */
                <Link
                  href={license}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:underline max-lg:flex max-lg:min-h-11 max-lg:items-center"
                >
                  سياسة حقوق النشر
                </Link>
              ) : (
                license
              )}
            </Row>
          )}
        </dl>
      </div>

      {/* JBRSEO-6: CTA */}
      <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3.5 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">تريد محتوى مثل هذا يجذب عملاء لنشاطك من جوجل؟</p>
        <CtaTrackedLink
          href="https://www.jbrseo.com"
          target="_blank"
          rel="noopener noreferrer"
          label="Article Footer CTA — عملاء بلا إعلانات"
          type="BANNER"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-link hover:underline max-lg:min-h-11 max-lg:active:underline"
        >
          عملاء بلا إعلانات <span aria-hidden="true">↗</span>
        </CtaTrackedLink>
      </div>
    </footer>
  );
}

/** One provenance fact: its name on the start edge, its value on the end edge. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1.5 text-xs">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="truncate text-foreground">{children}</dd>
    </div>
  );
}
