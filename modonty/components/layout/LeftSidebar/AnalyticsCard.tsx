import type { ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconAnalytics,
  IconArticle,
  IconActivity,
  IconLike,
  IconComment,
  IconViews,
  IconTotal,
} from '@/lib/icons';
import type { CategoryAnalytics } from '@/lib/types';

interface AnalyticsCardProps {
  stats: CategoryAnalytics;
}

function StatCell({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md bg-muted/30 px-1 py-1.5">
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className={`text-sm font-bold tabular-nums leading-none ${highlight ? 'text-primary' : 'text-foreground'}`}>
          {value}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

export function AnalyticsCard({ stats }: AnalyticsCardProps) {
  return (
    <Card className="flex-none">
      <CardContent className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <IconAnalytics className="h-4 w-4 shrink-0 text-primary" />
          <h2 className="text-xs font-semibold text-foreground">بالأرقام</h2>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <StatCell icon={IconArticle}  label="المقالات" value={stats.totalBlogs.toLocaleString('ar-SA')} />
          <StatCell icon={IconViews}    label="مشاهدات"  value={stats.totalViews.toLocaleString('ar-SA')} />
          <StatCell icon={IconActivity} label="تفاعلات"  value={stats.totalReactions.toLocaleString('ar-SA')} />
          <StatCell icon={IconLike}     label="إعجابات"  value={stats.totalLikes.toLocaleString('ar-SA')} />
          <StatCell icon={IconComment}  label="تعليقات"  value={stats.totalComments.toLocaleString('ar-SA')} />
          <StatCell icon={IconTotal}    label="متوسط"    value={Number(stats.averageCommentsPerBlog).toLocaleString('ar-SA')} highlight />
        </div>
      </CardContent>
    </Card>
  );
}
