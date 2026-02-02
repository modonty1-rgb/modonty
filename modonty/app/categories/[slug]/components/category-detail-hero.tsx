import { OptimizedImage } from "@/components/OptimizedImage";
import { FileText, TrendingUp, Clock } from "lucide-react";
import { generateCategoryGradient, getCategoryIcon } from "../../helpers/category-utils";

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
  const gradient = generateCategoryGradient(category.name);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
      <div className="container mx-auto max-w-[1128px] px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {category.socialImage ? (
            <div className="relative w-full md:w-48 aspect-video md:aspect-square shrink-0 overflow-hidden rounded-xl shadow-lg">
              <OptimizedImage
                src={category.socialImage}
                alt={category.socialImageAlt || category.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 192px"
              />
            </div>
          ) : (
            <div className={`relative w-full md:w-48 aspect-video md:aspect-square shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="h-20 w-20 text-white/90" />
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
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalArticles}</p>
                  <p className="text-sm text-muted-foreground">مقال</p>
                </div>
              </div>
              
              {stats.recentArticles > 0 && (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
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
                    <TrendingUp className="h-6 w-6 text-primary" />
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

      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 right-20 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
