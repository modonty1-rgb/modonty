import { notFound } from "next/navigation";
import { getClientPageData } from "../helpers/client-page-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import Link from "@/components/link";
import { Play } from "lucide-react";

interface ClientReelsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClientReelsPage({ params }: ClientReelsPageProps) {
  const { slug } = await params;

  const data = await getClientPageData(slug);

  if (!data) {
    notFound();
  }

  const { client, client: { articles } } = data;

  if (articles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            الريلز
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            لا توجد محتويات قصيرة (ريلز) لهذا العميل بعد. عند إضافة مقالات مع صور أو فيديوهات ستظهر هنا كفيديوهات قصيرة يمكن استكشافها.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {articles.map((article) => (
        <Link key={article.id} href={`/articles/${article.slug}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
            <div className="relative aspect-[9/16] w-full bg-muted">
              {article.featuredImage && (
                <>
                  <OptimizedImage
                    src={article.featuredImage.url}
                    alt={article.featuredImage.altText || article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 320px"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                    <Play className="h-3 w-3" />
                    <span>ريل</span>
                  </div>
                </>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-sm line-clamp-2 text-foreground">
                {article.title}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}

