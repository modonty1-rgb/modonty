import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "@/components/link";
import { ActivityItem } from "./activity-item";
import { IconActivity, IconChevronLeft, IconChevronRight } from "@/lib/icons";
import type { ActivityEntry, ActivityPagination } from "../helpers/profile-activity";

interface ActivityFeedProps {
  activities: ActivityEntry[];
  pagination: ActivityPagination;
}

export function ActivityFeed({ activities, pagination }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="h-5 w-5" />
            النشاط الأخير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            لا يوجد نشاط حتى الآن
          </p>
        </CardContent>
      </Card>
    );
  }

  const showPagination = pagination.totalPages > 1;
  const hasPrev = pagination.page > 1;
  const hasNext = pagination.page < pagination.totalPages;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconActivity className="h-5 w-5" />
          النشاط الأخير ({pagination.total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <ActivityItem key={`${activity.type}-${activity.timestamp.toISOString()}-${index}`} {...activity} />
          ))}
        </div>

        {showPagination && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t">
            {hasPrev ? (
              <Link
                href={`/users/profile?page=${pagination.page - 1}#activity`}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <IconChevronRight className="h-4 w-4" />
                السابق
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm opacity-50 cursor-not-allowed">
                <IconChevronRight className="h-4 w-4" />
                السابق
              </span>
            )}

            <div className="text-sm text-muted-foreground">
              صفحة {pagination.page} من {pagination.totalPages}
            </div>

            {hasNext ? (
              <Link
                href={`/users/profile?page=${pagination.page + 1}#activity`}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
              >
                التالي
                <IconChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm opacity-50 cursor-not-allowed">
                التالي
                <IconChevronLeft className="h-4 w-4" />
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
