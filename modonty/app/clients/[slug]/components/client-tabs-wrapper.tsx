"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./client-tabs";
import { ClientAbout } from "./client-about";
import { ClientContact } from "./client-contact";
import { RelatedClients } from "./related-clients";
import { ArticleList } from "./article-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/OptimizedImage";
import Link from "@/components/link";

interface ClientTabsWrapperProps {
  articles: any[];
  articlesCount: number;
  client: any;
  relatedClients: any[];
}

export function ClientTabsWrapper({
  articles,
  articlesCount,
  client,
  relatedClients,
}: ClientTabsWrapperProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        <TabsTrigger value="articles">المقالات ({articlesCount})</TabsTrigger>
        <TabsTrigger value="about">معلومات</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ClientAbout client={client} />
          </div>
          <div className="space-y-6">
            <ClientContact client={client} />
            <RelatedClients clients={relatedClients} />
          </div>
        </div>

        {/* Featured Articles in Overview */}
        {articles.length > 0 && (
          <section aria-labelledby="latest-articles-heading" className="mt-8">
            <h2 id="latest-articles-heading" className="text-xl font-semibold mb-4">
              أحدث المقالات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 3).map((article: any) => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full">
                    {article.featuredImage && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                        <OptimizedImage
                          src={article.featuredImage.url}
                          alt={article.featuredImage.alt || article.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-3 text-base md:text-lg">
                        {article.title}
                      </CardTitle>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {article.excerpt}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {article.category && <span>{article.category.name}</span>}
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
          </section>
        )}
      </TabsContent>

      {/* Articles Tab */}
      <TabsContent value="articles">
        <ArticleList articles={articles} clientName={client.name} />
      </TabsContent>

      {/* About Tab */}
      <TabsContent value="about" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ClientAbout client={client} />
          </div>
          <div>
            <ClientContact client={client} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
