import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  MessageSquare,
  CornerDownRight,
  Share2,
} from "lucide-react";

interface VisitorEngagementProps {
  totals: { likes: number; dislikes: number; favorites: number; comments: number; replies: number; shares: number };
  today: { likes: number; dislikes: number; favorites: number; comments: number; shares: number };
  week: { likes: number; dislikes: number; favorites: number; comments: number; shares: number };
  sharesByPlatform: Array<{ platform: string; count: number }>;
  topSharedArticles: Array<{ articleId: string; title: string; count: number }>;
}

const PLATFORM_LABELS: Record<string, string> = {
  FACEBOOK: "Facebook",
  TWITTER: "Twitter / X",
  LINKEDIN: "LinkedIn",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  COPY_LINK: "Copy Link",
  PRINT: "Print",
  OTHER: "Other",
};

const PLATFORM_COLORS: Record<string, string> = {
  FACEBOOK: "bg-blue-500",
  TWITTER: "bg-sky-500",
  LINKEDIN: "bg-indigo-500",
  WHATSAPP: "bg-emerald-500",
  EMAIL: "bg-amber-500",
  COPY_LINK: "bg-violet-500",
  PRINT: "bg-stone-500",
  OTHER: "bg-muted-foreground",
};

const metrics = [
  { key: "likes",     label: "Likes",     icon: ThumbsUp,         color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "dislikes",  label: "Dislikes",  icon: ThumbsDown,       color: "text-red-500",     bg: "bg-red-500/10" },
  { key: "favorites", label: "Favorites", icon: Bookmark,         color: "text-amber-500",   bg: "bg-amber-500/10" },
  { key: "comments",  label: "Comments",  icon: MessageSquare,    color: "text-blue-500",    bg: "bg-blue-500/10" },
  { key: "replies",   label: "Replies",   icon: CornerDownRight,  color: "text-sky-500",     bg: "bg-sky-500/10", todayKey: null },
  { key: "shares",    label: "Shares",    icon: Share2,            color: "text-violet-500",  bg: "bg-violet-500/10" },
] as const;

export function VisitorEngagementCard({
  totals,
  today,
  week,
  sharesByPlatform,
  topSharedArticles,
}: VisitorEngagementProps) {
  const totalSharesLast30 = sharesByPlatform.reduce((s, p) => s + p.count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Visitor Engagement</CardTitle>
        <p className="text-xs text-muted-foreground">All article interactions from visitors</p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* ── Metrics grid ── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {metrics.map(({ key, label, icon: Icon, color, bg }) => {
            const total = totals[key as keyof typeof totals];
            const todayVal = key !== "replies" ? (today[key as keyof typeof today] ?? 0) : null;
            const weekVal = key !== "replies" ? (week[key as keyof typeof week] ?? 0) : null;

            return (
              <div key={key} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${bg} text-center`}>
                <Icon className={`h-4 w-4 ${color}`} />
                <div className={`text-2xl font-bold tabular-nums leading-none ${color}`}>
                  {total.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
                {todayVal !== null && (
                  <div className="text-[9px] text-muted-foreground">
                    <span className={todayVal > 0 ? color : ""}>{todayVal}</span> today
                    {weekVal !== null && <> · <span className={weekVal > 0 ? color : ""}>{weekVal}</span> wk</>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Shares by platform ── */}
        {sharesByPlatform.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Shares by platform — last 30 days</p>
            <div className="space-y-1.5">
              {sharesByPlatform.slice(0, 5).map(({ platform, count }) => {
                const pct = totalSharesLast30 > 0 ? Math.round((count / totalSharesLast30) * 100) : 0;
                const barColor = PLATFORM_COLORS[platform] ?? "bg-muted-foreground";
                return (
                  <div key={platform} className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${barColor}`} />
                    <span className="text-xs text-muted-foreground w-24 shrink-0">
                      {PLATFORM_LABELS[platform] ?? platform}
                    </span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium tabular-nums w-8 text-right">{count}</span>
                    <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Top shared articles ── */}
        {topSharedArticles.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Most shared articles — last 30 days</p>
            {topSharedArticles.map(({ articleId, title, count }, i) => (
              <div key={articleId} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                <Link
                  href={`/articles/${articleId}`}
                  className="text-xs font-medium hover:text-primary truncate flex-1"
                >
                  {title}
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  <Share2 className="h-3 w-3 text-violet-500" />
                  <span className="text-xs font-bold text-violet-600 tabular-nums">{count}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty state */}
        {totals.likes === 0 && totals.comments === 0 && totals.shares === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No visitor interactions yet. Once articles are published and visitors engage, metrics will appear here.
          </p>
        )}

      </CardContent>
    </Card>
  );
}
