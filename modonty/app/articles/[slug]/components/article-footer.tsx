import Link from "@/components/link";
import { RelativeTime } from "@/components/date/RelativeTime";
import { CtaTrackedLink } from "@/components/cta-tracked-link";

interface ArticleFooterProps {
  client: {
    name: string;
    slug: string;
  };
  dateModified: Date | null;
  lastReviewed: Date | null;
  contentDepth: string | null;
  license: string | null;
}

export function ArticleFooter({
  client,
  dateModified,
  lastReviewed,
  contentDepth,
  license,
}: ArticleFooterProps) {
  return (
    <footer className="my-8 md:my-12 pt-6 md:pt-8 border-t">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            نشر بواسطة{" "}
            <Link
              href={`/clients/${client.slug}`}
              className="text-primary underline"
            >
              {client.name}
            </Link>
          </p>
          {dateModified && (
            <p className="text-xs text-muted-foreground mt-1">
              آخر تحديث: <RelativeTime date={dateModified} />
            </p>
          )}
          {lastReviewed && (
            <p className="text-xs text-muted-foreground mt-1">
              آخر مراجعة: <RelativeTime date={lastReviewed} />
            </p>
          )}
          {contentDepth && (
            <p className="text-xs text-muted-foreground mt-1">
              عمق المحتوى: {contentDepth}
            </p>
          )}
          {license && (
            <p className="text-xs text-muted-foreground mt-1">
              الرخصة:{" "}
              {license.startsWith("http") ? (
                <Link href={license} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  {license}
                </Link>
              ) : (
                license
              )}
            </p>
          )}
        </div>
      </div>

      {/* JBRSEO-6: CTA */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3.5">
        <p className="text-sm text-muted-foreground">
          تريد محتوى مثل هذا يجذب عملاء لنشاطك من جوجل؟
        </p>
        <CtaTrackedLink
          href="https://www.jbrseo.com"
          target="_blank"
          rel="noopener noreferrer"
          label="Article Footer CTA — عملاء بلا إعلانات"
          type="BANNER"
          className="shrink-0 text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          عملاء بلا إعلانات <span aria-hidden="true">↗</span>
        </CtaTrackedLink>
      </div>
    </footer>
  );
}
