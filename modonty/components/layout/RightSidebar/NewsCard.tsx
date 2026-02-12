import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "@/components/link";
import { NewsItem } from "./NewsItem";
import type { RightSidebarArticle } from "./types";

interface NewsCardProps {
  articles: RightSidebarArticle[];
  logoSrc: string;
}

export function NewsCard({ articles, logoSrc }: NewsCardProps) {
  return (
    <Card className="flex-none basis-[26%] min-h-0">
      <CardContent className="p-4 flex h-full flex-col">
        <Link
          href="/news"
          className="mb-3 flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src={logoSrc}
            alt="مودونتي"
            width={110}
            height={62}
            className="object-contain"
          />
          <h2 className="text-xs font-semibold text-foreground">أخبار مودونتي</h2>
        </Link>
        <div className="space-y-3 flex-1 min-h-0 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {articles.length > 0 ? (
            articles.slice(0, 3).map((article, index) => (
              <NewsItem
                key={article.id}
                title={article.title}
                description={article.excerpt || ""}
                badge={index === 0 ? "رائج" : undefined}
                slug={article.slug}
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
