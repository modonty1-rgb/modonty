import { OptimizedImage } from "@/components/media/OptimizedImage";
import { IconArticle, IconTrending, IconClock } from "@/lib/icons";
import { getCategoryIcon } from "../../helpers/category-utils";

interface CategoryDetailHeroProps {
  category: {
    name: string;
    description?: string | null;
    socialImage?: string | null;
    socialImageAlt?: string | null;
  };
  stats: {
    totalArticles: number;
    recentArticles: number;
    totalEngagement: number;
  };
}

export function CategoryDetailHero({ category, stats }: CategoryDetailHeroProps) {
  const Icon = getCategoryIcon(category.name);

  return (
    <div className="relative overflow-hidden border-b border-border bg-primary/5">
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-1 bg-accent"
        aria-hidden
      />
      <div className="relative z-10 container mx-auto max-w-[1128px] px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {category.socialImage ? (
            <div className="relative w-full md:w-48 aspect-video md:aspect-square shrink-0 overflow-hidden rounded-xl shadow-lg">
              <OptimizedImage
                src={category.socialImage}
                alt={category.socialImageAlt || category.name}
                fill
                preload
                loading="eager"
                fetchPriority="high"
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ) : (
            <div className="relative flex w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-background shadow-lg aspect-video md:aspect-square md:w-48">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Icon className="h-20 w-20" />
              </div>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
                {category.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IconArticle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-foreground">
                    {stats.totalArticles}
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">مقال</p>
                </div>
              </div>
              
              {stats.recentArticles > 0 && (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconClock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.recentArticles}</p>
                    <p className="text-sm text-muted-foreground">هذا الأسبوع</p>
                  </div>
                </div>
              )}

              {stats.totalEngagement > 0 && (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconTrending className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalEngagement}</p>
                    <p className="text-sm text-muted-foreground">تفاعل</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
