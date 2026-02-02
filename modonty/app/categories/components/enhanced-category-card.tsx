import Link from "@/components/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { 
  generateCategoryGradient, 
  getCategoryIcon, 
  formatCategoryStats,
  optimizeCloudinaryImage,
  generateBlurDataURL
} from "../helpers/category-utils";
import type { CategoryResponse } from "@/app/api/helpers/types";

interface EnhancedCategoryCardProps {
  category: CategoryResponse;
  priority?: boolean;
}

export function EnhancedCategoryCard({ category, priority = false }: EnhancedCategoryCardProps) {
  const Icon = getCategoryIcon(category.name);
  const gradient = generateCategoryGradient(category.name);
  const showTrending = (category.recentArticleCount || 0) > 0;

  const optimizedImageUrl = category.socialImage 
    ? optimizeCloudinaryImage(category.socialImage, {
        width: 600,
        height: 338,
        quality: 'auto',
        format: 'auto'
      })
    : null;

  const GradientFallback = () => (
    <div className={`relative aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-br ${gradient}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="h-16 w-16 text-white/90" />
      </div>
    </div>
  );

  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full">
        {optimizedImageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            <OptimizedImage
              src={optimizedImageUrl}
              alt={category.socialImageAlt || category.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <noscript>
              <GradientFallback />
            </noscript>
          </div>
        ) : (
          <GradientFallback />
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {category.name}
            </CardTitle>
            {showTrending && (
              <Badge variant="secondary" className="shrink-0 gap-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">رائج</span>
              </Badge>
            )}
          </div>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {category.description}
            </p>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">
                {formatCategoryStats(category.articleCount)}
              </span>
              <span className="text-xs text-muted-foreground">مقال</span>
            </div>
            {showTrending && (
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-primary">
                  {category.recentArticleCount}
                </span>
                <span className="text-xs text-muted-foreground">هذا الأسبوع</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
