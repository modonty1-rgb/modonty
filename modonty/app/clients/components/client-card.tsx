import Link from "@/components/link";
import { FileText, CheckCircle2, Eye, Users, MessageCircle, ThumbsUp, ThumbsDown, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMetric, calculateEngagementScore, getEngagementLabel } from "../helpers/format-metrics";
import { MetricChip } from "./metric-chip";
import { ClientCardExternalLink } from "./client-card-external-link";

interface ClientCardProps {
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
  url?: string;
}

export function ClientCard(props: ClientCardProps) {
  const initials = props.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const isPremium = props.subscriptionTier === 'PREMIUM';
  const isPro = props.subscriptionTier === 'PRO';
  
  const engagementScore = calculateEngagementScore({
    views: props.viewsCount,
    comments: props.commentsCount,
    likes: props.likesCount,
    subscribers: props.subscribersCount,
  });
  
  const engagementLabel = getEngagementLabel(engagementScore);
  const totalEngagement = props.commentsCount + props.likesCount + props.dislikesCount + props.favoritesCount;
  
  return (
    <Link 
      href={`/clients/${encodeURIComponent(props.slug)}`}
      className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
    >
      <Card 
        role="article" 
        aria-label={`${props.name} - ${props.articleCount} مقالات`}
        className={cn(
          "h-full flex flex-col group hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer",
          isPremium && "ring-2 ring-primary/20 shadow-lg shadow-primary/5",
          isPro && "ring-1 ring-primary/10"
        )}
      >
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <Avatar className="h-20 w-20 ring-2 ring-background shadow-lg group-hover:ring-primary/30 transition-all bg-gradient-to-br from-primary/10 to-primary/20">
              <AvatarImage src={props.logo} alt={props.name} />
              <AvatarFallback className="text-2xl font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {props.isVerified && (
              <>
                {isPremium ? (
                  <Badge 
                    variant="secondary" 
                    className="gap-1 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    بريميوم
                  </Badge>
                ) : (
                  <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 fill-green-600/20 dark:fill-green-400/20" />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {props.name}
            </h3>
            {props.legalName && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {props.legalName}
              </p>
            )}
          </div>

          {props.industry && (
            <Badge variant="outline" className="w-fit">
              {props.industry.name}
            </Badge>
          )}
          
          {props.articleCount === 0 && (
            <Badge variant="outline" className="text-xs w-fit">
              عميل جديد
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          {props.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {props.description}
            </p>
          )}

          <div role="group" aria-label="مقاييس الأداء" className="mt-auto">
            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span>مقالات</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {formatMetric(props.articleCount)}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  <span>مشاهدات</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {props.viewsCount === 0 ? (
                    <span className="text-xs text-muted-foreground italic">لا توجد بعد</span>
                  ) : (
                    formatMetric(props.viewsCount)
                  )}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>مشتركون</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {formatMetric(props.subscribersCount)}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>التفاعل</span>
                </div>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-semibold">{engagementScore}</p>
                  <span className={cn("text-xs font-medium", engagementLabel.color)}>
                    {engagementLabel.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block pt-3 border-t border-dashed">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <MetricChip icon={MessageCircle} value={props.commentsCount} label="تعليقات" />
                <MetricChip icon={ThumbsUp} value={props.likesCount} label="إعجاب" color="text-green-600" />
                <MetricChip icon={ThumbsDown} value={props.dislikesCount} label="رفض" color="text-red-600" />
                <MetricChip icon={Star} value={props.favoritesCount} label="مفضلة" color="text-yellow-600" />
              </div>
            </div>

            <div className="sm:hidden flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t border-dashed">
              <span>{formatMetric(totalEngagement)} تفاعل كلي</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center gap-2 pt-0">
          <Button size="sm" className="flex-1 group-hover:shadow-md transition-shadow duration-300">
            عرض الملف
          </Button>
          {props.url && <ClientCardExternalLink url={props.url} />}
        </CardFooter>
      </Card>
    </Link>
  );
}
