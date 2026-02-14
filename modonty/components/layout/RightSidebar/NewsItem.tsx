import Link from "@/components/link";
import { Badge } from "@/components/ui/badge";

interface NewsItemProps {
  title: string;
  description?: string;
  badge?: string;
  slug?: string;
  showDescription?: boolean;
  showDot?: boolean;
}

export function NewsItem({ title, description = "", badge, slug, showDescription = true, showDot = false }: NewsItemProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {showDot && (
            <span
              className="h-1 w-1 shrink-0 rounded-full bg-accent"
              aria-hidden
            />
          )}
          <h3 className="text-sm font-semibold leading-tight line-clamp-1 min-w-0">{title}</h3>
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      {showDescription && description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </>
  );

  if (slug) {
    return (
      <Link
        href={`/articles/${slug}`}
        className="block space-y-1 rounded-md py-1.5 px-2 -mx-1 hover:bg-muted/50 hover:text-primary transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </Link>
    );
  }

  return <div className="space-y-1">{content}</div>;
}
