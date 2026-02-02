import Link from "@/components/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  publishedAt: Date;
  clientName: string;
  status: "published" | "draft";
}

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`}>
      <Card
        className={cn(
          "w-full transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer"
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-semibold leading-tight text-foreground hover:text-primary transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {article.excerpt}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {article.clientName}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(article.publishedAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}




