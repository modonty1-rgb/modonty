"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleTable } from "@/app/(dashboard)/articles/components/article-table";
import type { Article as ArticleViewType } from "@/app/(dashboard)/articles/[id]/helpers/article-view-types";

type Article = ArticleViewType & { views: number };

interface CategoryArticlesProps {
  articles: Article[];
  categoryId: string;
}

// The category's articles use the EXACT same table as /articles (entity-standard #2/#3):
// SEO-score column (SeoScoreBadge), row density, sorting, pagination — one source of truth.
// getCategoryArticles fetches ALL of them (no 50-row cap) so the count never lies.
export function CategoryArticles({ articles, categoryId }: CategoryArticlesProps) {
  const [search, setSearch] = useState("");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Articles</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/articles?categoryId=${categoryId}`}>View All Articles</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <ArticleTable articles={articles} search={search} />
        </div>
      </CardContent>
    </Card>
  );
}
