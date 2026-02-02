import Link from "@/components/link";
import { CheckCircle2, FileText, Eye, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMetric, calculateEngagementScore, getEngagementLabel } from "../helpers/format-metrics";

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
}

export function ClientListItem(props: ClientListItemProps) {
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
  
  return (
    <Link 
      href={`/clients/${props.slug}`}
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
            <Avatar className="h-16 w-16 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/20">
              <AvatarImage src={props.logo} alt={props.name} />
              <AvatarFallback className="text-lg font-semibold text-primary">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg truncate">{props.name}</h3>
                {props.isVerified && (
                  <>
                    {isPremium ? (
                      <Badge 
                        variant="secondary"
                        className="gap-1 text-xs bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        بريميوم
                      </Badge>
                    ) : (
                      <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 fill-green-600/20 dark:fill-green-400/20" />
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
                  <FileText className="h-3.5 w-3.5" />
                  <span>مقالات</span>
                </div>
                <span className="text-sm font-semibold">{formatMetric(props.articleCount)}</span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  <span>مشاهدات</span>
                </div>
                <span className="text-sm font-semibold">
                  {props.viewsCount === 0 ? (
                    <span className="text-xs text-muted-foreground italic">-</span>
                  ) : (
                    formatMetric(props.viewsCount)
                  )}
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>مشتركون</span>
                </div>
                <span className="text-sm font-semibold">{formatMetric(props.subscribersCount)}</span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
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

            <Button size="sm" variant="outline" className="flex-shrink-0">
              عرض
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
