import Link from "@/components/link";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { EntityPlaceholder } from "@/components/shared/EntityPlaceholder";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { optimizeCloudinaryImage } from "@/app/categories/helpers/category-utils";
import { IconArticle, IconIndustry } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { EntityType } from "@/lib/entity-utils";

export interface EntityCardClientPreview {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface EntityCardProps {
  type: EntityType;
  name: string;
  slug: string;
  imageUrl?: string;
  imageAlt?: string;
  articleCount: number;
  recentArticleCount?: number;
  clientPreviews: EntityCardClientPreview[];
  clientCount: number;
  /** Computed and real (GA4 + DB engagement) — hidden from the card 2026-07-04 until organic traffic makes it a meaningful number. Kept on the type so callers/data layer don't need touching when it's re-enabled. */
  digitalImpact?: number;
  preload?: boolean;
}

const BASE_PATH: Record<EntityType, string> = {
  category: "/categories",
  industry: "/industries",
  tag: "/tags",
};

export function EntityCard({
  type,
  name,
  slug,
  imageUrl,
  imageAlt,
  articleCount,
  recentArticleCount = 0,
  clientPreviews,
  clientCount,
  preload = false,
}: EntityCardProps) {
  const showTrending = type !== "industry" && recentArticleCount > 0;
  const overflowCount = clientCount > 3 ? clientCount - 3 : 0;

  const optimizedImageUrl = imageUrl
    ? optimizeCloudinaryImage(imageUrl, { width: 600, height: 375, quality: "auto", format: "auto" })
    : null;

  return (
    <Link href={`${BASE_PATH[type]}/${slug}`} className="block h-full">
      <div className="group h-full overflow-hidden rounded-2xl bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative overflow-hidden rounded-t-2xl" style={{ aspectRatio: "16/10" }}>
          {optimizedImageUrl ? (
            <OptimizedImage
              src={optimizedImageUrl}
              alt={imageAlt || name}
              fill
              preload={preload}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <EntityPlaceholder type={type} />
          )}

          {showTrending && (
            <span className="absolute top-2 start-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              🔥 رائج
            </span>
          )}

          <span className="absolute top-2 end-2 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            {type === "industry" ? (
              <IconIndustry className="h-2.5 w-2.5" aria-hidden />
            ) : (
              <IconArticle className="h-2.5 w-2.5" aria-hidden />
            )}
            {articleCount}
            {type === "industry" && " شركة"}
          </span>
        </div>

        <div className="p-4">
          <h3 className="mb-3 line-clamp-2 text-[15px] font-extrabold leading-snug text-card-foreground">
            {name}
          </h3>

          <div className="flex items-center gap-2 border-t border-border pt-2.5">
            {clientCount > 0 ? (
              <>
                <div className="flex">
                  {clientPreviews.slice(0, 3).map((client, i) => (
                    <Avatar
                      key={client.id}
                      className={cn("h-8 w-8 ring-2 ring-card", i > 0 && "-ms-2")}
                    >
                      <AvatarImage src={client.logoUrl} alt={client.name} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-[11px] font-bold text-primary">
                        {client.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {overflowCount > 0 && (
                    <div className="-ms-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary ring-2 ring-card">
                      +{overflowCount}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{clientCount} شريك</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground/60">لا شركاء بعد</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
