import type { ComponentType, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconAnalytics,
  IconActivity,
  IconArticle,
  IconTotal,
  IconLike,
  IconComment,
  IconViews,
} from "@/lib/icons";
import type { CategoryAnalytics } from "@/lib/types";

interface AnalyticsCardProps {
  stats: CategoryAnalytics;
}

function AnalyticsStatRow({
  icon: Icon,
  label,
  formattedValue,
  barValue,
  maxValue,
  valueClassName = "text-sm font-semibold text-foreground w-10 text-start tabular-nums shrink-0",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  formattedValue: ReactNode;
  barValue: number;
  maxValue: number;
  valueClassName?: string;
}) {
  const pct = Math.round((barValue / maxValue) * 100);
  return (
    <div className="flex w-full items-center gap-2 py-1">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate text-sm text-muted-foreground">{label}</span>
      <div className="h-1 w-[56px] shrink-0 overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <span className={valueClassName}>{formattedValue}</span>
    </div>
  );
}

export function AnalyticsCard({ stats }: AnalyticsCardProps) {
  const maxValue = Math.max(
    stats.totalBlogs,
    stats.totalReactions,
    stats.averageCommentsPerBlog,
    stats.totalLikes,
    stats.totalComments,
    stats.totalViews,
    1
  );

  return (
    <Card className="flex-none">
      <CardContent className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <IconAnalytics className="h-4 w-4 shrink-0 text-primary" />
          <h2 className="text-xs font-semibold text-foreground">تحليلات</h2>
        </div>

        <div className="space-y-0 divide-y divide-border">
          <AnalyticsStatRow
            icon={IconArticle}
            label="المقالات"
            barValue={stats.totalBlogs}
            maxValue={maxValue}
            formattedValue={stats.totalBlogs}
          />
          <AnalyticsStatRow
            icon={IconActivity}
            label="التفاعلات الكلية"
            barValue={stats.totalReactions}
            maxValue={maxValue}
            formattedValue={stats.totalReactions.toLocaleString("ar-SA")}
          />
          <AnalyticsStatRow
            icon={IconTotal}
            label="متوسط لكل مقال"
            barValue={stats.averageCommentsPerBlog}
            maxValue={maxValue}
            formattedValue={stats.averageCommentsPerBlog}
            valueClassName="text-sm font-semibold text-primary w-10 text-start tabular-nums shrink-0"
          />
        </div>

        <div className="mt-2 space-y-0 divide-y divide-border border-t border-border pt-2">
          <AnalyticsStatRow
            icon={IconLike}
            label="إعجابات"
            barValue={stats.totalLikes}
            maxValue={maxValue}
            formattedValue={stats.totalLikes.toLocaleString("ar-SA")}
          />
          <AnalyticsStatRow
            icon={IconComment}
            label="تعليقات"
            barValue={stats.totalComments}
            maxValue={maxValue}
            formattedValue={stats.totalComments.toLocaleString("ar-SA")}
          />
          <AnalyticsStatRow
            icon={IconViews}
            label="مشاهدات"
            barValue={stats.totalViews}
            maxValue={maxValue}
            formattedValue={stats.totalViews.toLocaleString("ar-SA")}
          />
        </div>

        <span className="inline-flex items-center gap-1 hidden" title="مفضلة" aria-hidden>
          {stats.totalFavorites.toLocaleString("ar-SA")}
        </span>
        <span className="inline-flex items-center gap-1 hidden" title="عدم إعجاب" aria-hidden>
          {stats.totalDislikes.toLocaleString("ar-SA")}
        </span>
      </CardContent>
    </Card>
  );
}
