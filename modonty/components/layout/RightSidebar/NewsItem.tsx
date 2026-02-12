import Link from "@/components/link";
import { Badge } from "@/components/ui/badge";

interface NewsItemProps {
  title: string;
  description: string;
  badge?: string;
  slug?: string;
}

export function NewsItem({ title, description, badge, slug }: NewsItemProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight">{title}</h3>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </>
  );

  if (slug) {
    return (
      <Link href={`/articles/${slug}`} className="block space-y-1 hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return <div className="space-y-1">{content}</div>;
}
