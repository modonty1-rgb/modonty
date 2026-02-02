import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Mail } from "lucide-react";
import Link from "@/components/link";
import { getRecentArticles } from "@/app/api/helpers/article-queries";
import { Logo } from "@/components/Logo";

export async function RightSidebar() {
  const suggestedArticles = await getRecentArticles(3);
  return (
    <aside className="hidden xl:block w-[300px] sticky top-[3.5rem] self-start max-h-[calc(100vh-4rem)] overflow-y-auto will-change-transform scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 h-10">
            <Logo size="footer" showLink={false} forceMobile={true} />
            <h2 className="text-sm font-semibold">أخبار مودونتي</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestedArticles.length > 0 ? (
            suggestedArticles.slice(0, 3).map((article, index) => (
              <NewsItem
                key={article.id}
                title={article.title}
                description={article.excerpt || ""}
                badge={index === 0 ? "رائج" : undefined}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground">لا توجد أخبار حالياً</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">
            مقالات قد تعجبك
          </h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestedArticles.length > 0 ? (
            suggestedArticles.map((article) => (
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">النشرة الإخبارية</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            احصل على رؤى وتحديثات أسبوعية في بريدك الإلكتروني
          </p>
          <form className="space-y-2">
            <input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
            />
            <Button type="submit" className="w-full h-9 text-sm">
              اشترك
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground">
            نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.
          </p>
        </CardContent>
      </Card>
      </div>
      <div className="sticky bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none -mt-16" />
    </aside>
  );
}

function NewsItem({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight">{title}</h3>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ArticleSuggestion({ title, client, slug }: { title: string; client: string; slug: string }) {
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

