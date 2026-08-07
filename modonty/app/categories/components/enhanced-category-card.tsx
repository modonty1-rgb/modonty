import { FileText } from "lucide-react";
import Link from "@/components/link";
import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTrending } from "@/lib/icons";
import {
  generateCategoryGradient,
  getCategoryIcon,
} from "../helpers/category-utils";
import type { CategoryResponse } from "@/lib/types";

interface EnhancedCategoryCardProps {
  category: CategoryResponse;
  preload?: boolean;
}

export function EnhancedCategoryCard({ category, preload = false }: EnhancedCategoryCardProps) {
  const Icon = getCategoryIcon(category.name);
  const gradient = generateCategoryGradient(category.name);
  const showTrending = (category.recentArticleCount || 0) > 0;
  const clientPreviews = category.clientPreviews ?? [];
  const clientCount = category.clientCount ?? 0;
  const overflowCount = clientCount > 3 ? clientCount - 3 : 0;

  // `socialImage` is a bare url on the Category row, not a Media relation — so it goes
  // through `asMedia` (no stored blur to carry). The old `optimizeCloudinaryImage` wrapper
  // was dropped: it rewrites Cloudinary urls only, and all 46 entity images are on Bunny
  // (verified 2026-08-07: categories 15/15, tags 23/23, industries 8/8 → zero Cloudinary),
  // so it had become a pass-through that only obscured what the code actually did.
  const socialImage = category.socialImage?.trim() || null;

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
        {socialImage ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            <OptimizedImage
              media={asMedia(socialImage, category.socialImageAlt)}
              alt={category.socialImageAlt || category.name}
              fill
              preload={preload}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        ) : (
          <GradientFallback />
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
              {category.name}
            </CardTitle>
            {showTrending && (
              <Badge variant="secondary" className="shrink-0 gap-1">
                <IconTrending className="h-3 w-3" />
                <span className="text-xs">رائج</span>
              </Badge>
            )}
          </div>
          {category.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {category.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            {/* Avatar group */}
            {clientCount > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {clientPreviews.slice(0, 3).map((client, i) => (
                    <Avatar
                      key={client.id}
                      className={`h-6 w-6 border-2 border-card ${i > 0 ? "-ms-2" : ""}`}
                    >
                      <AvatarImage
                        src={client.logoUrl}
                        alt={client.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                        {client.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {overflowCount > 0 && (
                    <div className="-ms-2 h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                      +{overflowCount}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{clientCount} شريك</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground/60">لا شركاء بعد</span>
            )}

            {/* Article chip */}
            <div className="inline-flex items-center gap-1 bg-muted/50 border border-border/50 rounded-full px-2.5 py-1 text-xs text-muted-foreground shrink-0">
              <FileText className="h-3 w-3" />
              {category.articleCount}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
