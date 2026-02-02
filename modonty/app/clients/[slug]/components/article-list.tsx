"use client";

import { useState, useMemo } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";
import Link from "@/components/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, ArrowUpDown, Calendar, TrendingUp } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  datePublished?: Date | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
}

interface ArticleListProps {
  articles: Article[];
  clientName: string;
}

type SortOption = "newest" | "oldest" | "title";

export function ArticleList({ articles, clientName }: ArticleListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const sortedArticles = useMemo(() => {
    const sorted = [...articles];
    
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => {
          if (!a.datePublished) return 1;
          if (!b.datePublished) return -1;
          return new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime();
        });
      case "oldest":
        return sorted.sort((a, b) => {
          if (!a.datePublished) return 1;
          if (!b.datePublished) return -1;
          return new Date(a.datePublished).getTime() - new Date(b.datePublished).getTime();
        });
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
      default:
        return sorted;
    }
  }, [articles, sortBy]);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "newest":
        return "الأحدث أولاً";
      case "oldest":
        return "الأقدم أولاً";
      case "title":
        return "الترتيب الأبجدي";
    }
  };

  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">لا توجد مقالات بعد</p>
          <p className="text-muted-foreground">لم يتم نشر أي مقالات من {clientName} حتى الآن.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Filter/Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {articles.length} {articles.length === 1 ? 'مقال' : 'مقالات'}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {getSortLabel(sortBy)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setSortBy("newest")}
              className="gap-2 cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              الأحدث أولاً
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("oldest")}
              className="gap-2 cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              الأقدم أولاً
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("title")}
              className="gap-2 cursor-pointer"
            >
              <TrendingUp className="h-4 w-4" />
              الترتيب الأبجدي
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedArticles.map((article) => (
          <Link key={article.id} href={`/articles/${article.slug}`}>
            <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full">
              {article.featuredImage && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                  <OptimizedImage
                    src={article.featuredImage.url}
                    alt={article.featuredImage.altText || article.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-3 text-base md:text-lg">{article.title}</CardTitle>
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {article.excerpt}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {article.category && (
                    <span>{article.category.name}</span>
                  )}
                  {article.datePublished && (
                    <span>
                      {new Date(article.datePublished).toLocaleDateString("ar-SA")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
