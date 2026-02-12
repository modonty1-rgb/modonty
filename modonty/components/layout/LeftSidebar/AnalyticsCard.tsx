import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Heart, MessageCircle, FileText, ThumbsUp, ThumbsDown, Eye, Sigma } from "lucide-react";
import type { CategoryAnalytics } from "@/lib/types";

interface AnalyticsCardProps {
  stats: CategoryAnalytics;
}

export function AnalyticsCard({ stats }: AnalyticsCardProps) {
  return (
    <Card className="flex-none basis-[28%] min-h-0">
      <CardContent className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 shrink-0 text-primary" />
          <h2 className="text-xs font-semibold text-foreground">تحليلات</h2>
        </div>

        <div className="space-y-2 text-[11px] text-muted-foreground">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              المقالات
            </span>
            <span className="text-sm font-bold text-foreground">{stats.totalBlogs}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              التفاعلات الكلية
            </span>
            <span className="text-sm font-bold text-foreground">{stats.totalReactions.toLocaleString("ar-SA")}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <Sigma className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              متوسط لكل مقال
            </span>
            <span className="text-sm font-bold text-primary">{stats.averageCommentsPerBlog}</span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 border-t border-border pt-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1" title="إعجابات">
            <ThumbsUp className="h-3 w-3" />
            {stats.totalLikes.toLocaleString("ar-SA")}
          </span>
          <span className="inline-flex items-center gap-1" title="مفضلة">
            <Heart className="h-3 w-3" />
            {stats.totalFavorites.toLocaleString("ar-SA")}
          </span>
          <span className="inline-flex items-center gap-1" title="تعليقات">
            <MessageCircle className="h-3 w-3" />
            {stats.totalComments.toLocaleString("ar-SA")}
          </span>
          <span className="inline-flex items-center gap-1" title="مشاهدات">
            <Eye className="h-3 w-3" />
            {stats.totalViews.toLocaleString("ar-SA")}
          </span>
          <span className="inline-flex items-center gap-1" title="عدم إعجاب">
            <ThumbsDown className="h-3 w-3" />
            {stats.totalDislikes.toLocaleString("ar-SA")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
