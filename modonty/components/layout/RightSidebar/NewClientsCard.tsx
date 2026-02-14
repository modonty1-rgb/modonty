import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { NewClientItem } from "./NewClientItem";
import type { RightSidebarArticle } from "./types";
import { ChevronLeft } from "lucide-react";

interface NewClientsCardProps {
  articles: RightSidebarArticle[];
}

export function NewClientsCard({ articles }: NewClientsCardProps) {
  return (
    <Card className="flex-1 min-h-0">
      <CardContent className="p-4 flex h-full flex-col">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase">
            شركاء النجاح
          </h2>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
          >
            عرض الكل
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="flex flex-1 min-h-0 flex-col gap-0 overflow-y-auto py-0.5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {articles.length > 0 ? (
            articles.map((article) => (
              <NewClientItem
                key={article.id}
                title={article.title}
                client={article.client.name}
                clientLogo={article.client.logo}
                slug={article.slug}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground">لا يوجد شركاء حالياً</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
