import Link from "@/components/link";
import { RelativeTime } from "@/components/RelativeTime";

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
              الرخصة: {license}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
