import { Card, CardContent } from "@/components/ui/card";
import Link from "@/components/link";
import { NewsItem } from "./NewsItem";
import type { RightSidebarArticle } from "./types";

interface ModontyCardProps {
  articles: RightSidebarArticle[];
}

export function ModontyCard({ articles }: ModontyCardProps) {
  return (
    <Card
      className="flex-none basis-[26%] min-h-0 overflow-x-hidden border-0"
      role="complementary"
      aria-label="جديد مودونتي"
    >
      <CardContent className="p-3 flex h-full flex-col min-w-0">
        <h2 className="text-xs font-semibold text-foreground pb-1.5 shrink-0">جديد مودونتي</h2>
        <div className="space-y-0.5 flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden py-0.5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {articles.length > 0 ? (
            articles.slice(0, 4).map((article) => (
              <NewsItem
                key={article.id}
                title={article.title}
                slug={article.slug}
                showDescription={false}
                showDot
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground">لا توجد أخبار حالياً</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
