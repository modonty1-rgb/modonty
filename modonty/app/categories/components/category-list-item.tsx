import Link from "@/components/link";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { 
  generateCategoryGradient, 
  getCategoryIcon, 
  formatCategoryStats,
  optimizeCloudinaryImage,
  generateBlurDataURL
} from "../helpers/category-utils";
import type { CategoryResponse } from "@/lib/types";

interface CategoryListItemProps {
  category: CategoryResponse;
  priority?: boolean;
}

export function CategoryListItem({ category, priority = false }: CategoryListItemProps) {
  const Icon = getCategoryIcon(category.name);
  const gradient = generateCategoryGradient(category.name);
  const showTrending = (category.recentArticleCount || 0) > 0;

  const optimizedImageUrl = category.socialImage 
    ? optimizeCloudinaryImage(category.socialImage, {
        width: 256,
        height: 256,
        quality: 'auto',
        format: 'auto'
      })
    : null;

  const GradientFallback = () => (
    <div className={`relative w-32 h-32 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <Icon className="h-12 w-12 text-white/90" />
    </div>
  );

  return (
    <Link href={`/categories/${category.slug}`}>
      <div className="group bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-primary cursor-pointer">
        <div className="flex gap-4">
          {optimizedImageUrl ? (
            <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded-lg bg-muted">
              <OptimizedImage
                src={optimizedImageUrl}
                alt={category.socialImageAlt || category.name}
                fill
                priority={priority}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="128px"
              />
              <noscript>
                <GradientFallback />
              </noscript>
            </div>
          ) : (
            <GradientFallback />
          )}

          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {category.name}
                </h3>
                {showTrending && (
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs">رائج</span>
                  </Badge>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {category.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground">
                    {formatCategoryStats(category.articleCount)}
                  </span>
                  <span className="text-xs text-muted-foreground">مقال</span>
                </div>
                {showTrending && (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-primary">
                      {category.recentArticleCount}
                    </span>
                    <span className="text-xs text-muted-foreground">هذا الأسبوع</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">عرض المقالات</span>
                <ArrowLeft className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
