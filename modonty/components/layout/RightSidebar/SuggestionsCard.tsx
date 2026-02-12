import { Card, CardContent } from "@/components/ui/card";
import { ArticleSuggestion } from "./ArticleSuggestion";
import type { RightSidebarArticle } from "./types";

interface SuggestionsCardProps {
  articles: RightSidebarArticle[];
}

export function SuggestionsCard({ articles }: SuggestionsCardProps) {
  return (
    <Card className="flex-1 min-h-0">
      <CardContent className="p-4 flex h-full flex-col">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
          مقالات قد تعجبك
        </h2>
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {articles.length > 0 ? (
            articles.map((article) => (
              <ArticleSuggestion
                key={article.id}
                title={article.title}
                client={article.client.name}
                slug={article.slug}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground">لا توجد مقالات مقترحة</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
