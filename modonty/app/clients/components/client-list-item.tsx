import Link from "@/components/link";
import { IconCheckCircle, IconArticle, IconViews, IconUsers, IconTrending } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRAND_AVATAR_RADIUS } from "@/lib/brand-avatar";
import { formatMetric, calculateEngagementScore, getEngagementLabel } from "../helpers/format-metrics";
import { ClientCardCta } from "./client-card-cta";

interface ClientListItemProps {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  description?: string;
  industry?: { name: string; slug: string };
  logo?: string;
  articleCount: number;
  viewsCount: number;
  subscribersCount: number;
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  favoritesCount: number;
  subscriptionTier?: string;
  isVerified: boolean;
  ctaMode?: "NONE" | "FORM" | "LINK" | null;
  ctaLabel?: string;
  ctaUrl?: string;
  ga4Total?: number;
}

export function ClientListItem(props: ClientListItemProps) {
  const initials = props.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const isPremium = props.subscriptionTier === 'PREMIUM';
  const isPro = props.subscriptionTier === 'PRO';
  
  const displayViews = props.ga4Total ?? props.viewsCount;
  const viewsLabel  = props.ga4Total !== undefined ? "تفاعلات" : "مشاهدات";
  const engagementScore = calculateEngagementScore({
    views: props.viewsCount,
    comments: props.commentsCount,
    likes: props.likesCount,
    subscribers: props.subscribersCount,
  });
  
  const engagementLabel = getEngagementLabel(engagementScore);
  
  return (
    <Link 
      href={`/clients/${encodeURIComponent(props.slug)}`}
      className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
    >
      <Card 
        className={cn(
          "hover:shadow-md hover:border-primary/50 transition-all cursor-pointer",
          isPremium && "ring-2 ring-primary/20 shadow-lg shadow-primary/5",
          isPro && "ring-1 ring-primary/10"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className={cn("h-16 w-16 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/20", BRAND_AVATAR_RADIUS)}>
              <AvatarImage src={props.logo} alt={props.name} />
              <AvatarFallback className={cn("text-lg font-semibold bg-primary text-primary-foreground", BRAND_AVATAR_RADIUS)}>{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg truncate">{props.name}</h3>
                {props.isVerified && (
                  <>
                    {isPremium ? (
                      <Badge 
                        variant="secondary"
                        className="gap-1 text-xs bg-primary/10 border-primary/30 text-primary"
                      >
                        <IconCheckCircle className="h-3 w-3" />
                        بريميوم
                      </Badge>
                    ) : (
                      <div className="bg-primary/10 p-1 rounded-full flex-shrink-0">
                        <IconCheckCircle className="h-4 w-4 text-primary fill-primary/20" />
                      </div>
                    )}
                  </>
                )}
              </div>
              {props.industry && (
                <Badge variant="outline" className="text-xs">{props.industry.name}</Badge>
              )}
              {props.articleCount === 0 && (
                <Badge variant="outline" className="text-xs">
                  عميل جديد
                </Badge>
              )}
              {props.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{props.description}</p>
              )}
            </div>

            <div className="hidden md:flex items-center gap-6 flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconArticle className="h-3.5 w-3.5" />
                  <span>مقالات</span>
                </div>
                <span className="text-sm font-semibold">{formatMetric(props.articleCount)}</span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {props.ga4Total !== undefined ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" aria-label="Google Analytics">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ) : (
                    <IconViews className="h-3.5 w-3.5" />
                  )}
                  <span>{viewsLabel}</span>
                </div>
                <span className="text-sm font-semibold">
                  {displayViews === 0 ? (
                    <span className="text-xs text-muted-foreground italic">-</span>
                  ) : (
                    formatMetric(displayViews)
                  )}
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconUsers className="h-3.5 w-3.5" />
                  <span>مشتركون</span>
                </div>
                <span className="text-sm font-semibold">{formatMetric(props.subscribersCount)}</span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconTrending className="h-3.5 w-3.5" />
                  <span>التفاعل</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold">{engagementScore}</span>
                  <span className={cn("text-[10px] font-medium", engagementLabel.color)}>
                    {engagementLabel.label}
                  </span>
                </div>
              </div>
            </div>

            {props.ctaMode === "LINK" && props.ctaUrl && (
              <ClientCardCta clientId={props.id} url={props.ctaUrl} label={props.ctaLabel} />
            )}
            <Button size="sm" variant="outline" className="flex-shrink-0">
              عرض
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
