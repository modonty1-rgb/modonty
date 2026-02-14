import Link from "@/components/link";
import { FileText, Eye, Users, MapPin, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMetric } from "../helpers/format-metrics";

interface FeaturedClientCardProps {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  industry?: { name: string; slug: string };
  logo?: string;
  articleCount: number;
  viewsCount: number;
  subscribersCount: number;
  subscriptionTier?: string;
  isVerified: boolean;
}

export function FeaturedClientCard(props: FeaturedClientCardProps) {
  const isPremium = props.subscriptionTier === 'PREMIUM';
  const isPro = props.subscriptionTier === 'PRO';
  
  return (
    <Link 
      href={`/clients/${encodeURIComponent(props.slug)}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <div className="relative h-[280px] rounded-xl overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: props.logo ? `url(${props.logo})` : 'none',
            backgroundColor: props.logo ? 'transparent' : 'hsl(var(--muted))'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          {/* Top Section - Badge */}
          <div className="flex justify-end">
            {props.isVerified && (
              <>
                {isPremium ? (
                  <Badge 
                    className={cn(
                      "gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500",
                      "text-white border-0 shadow-lg"
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    بريميوم
                  </Badge>
                ) : (
                  <Badge 
                    className={cn(
                      "gap-1.5 bg-emerald-500 text-white border-0 shadow-lg"
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    موثق
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Bottom Section - Company Info & Stats */}
          <div className="space-y-4">
            {/* Company Name & Industry */}
            <div className="space-y-2">
              <h3 className="font-bold text-2xl text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {props.name}
              </h3>
              
              <div className="flex items-center gap-3 flex-wrap">
                {props.legalName && (
                  <p className="text-sm text-white/80 line-clamp-1">
                    {props.legalName}
                  </p>
                )}
                {props.industry && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                    {props.industry.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{formatMetric(props.articleCount)} مقالات</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {props.viewsCount === 0 ? 'لا توجد' : formatMetric(props.viewsCount)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">{formatMetric(props.subscribersCount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
