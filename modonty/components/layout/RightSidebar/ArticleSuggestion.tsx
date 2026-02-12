import Link from "@/components/link";
import { TrendingUp } from "lucide-react";

interface ArticleSuggestionProps {
  title: string;
  client: string;
  slug: string;
}

export function ArticleSuggestion({ title, client, slug }: ArticleSuggestionProps) {
  return (
    <Link href={`/articles/${slug}`} className="flex items-start gap-3 hover:bg-muted/50 p-2 rounded-md transition-colors">
      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
        <TrendingUp className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate">{title}</h3>
        <p className="text-xs text-muted-foreground truncate">{client}</p>
      </div>
    </Link>
  );
}
