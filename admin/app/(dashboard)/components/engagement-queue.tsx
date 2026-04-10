import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye,
  MessageSquare,
  Mail,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EngagementQueueProps {
  pendingComments: number;
  newContactMessages: number;
  pendingFAQs: number;
  views: { today: number; yesterday: number; thisWeek: number; trend: number };
  recentPendingComments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: { name: string | null } | null;
    article: { id: string; title: string } | null;
  }>;
  recentContactMessages: Array<{
    id: string;
    name: string;
    subject: string;
    createdAt: Date;
  }>;
  recentPendingFAQs: Array<{
    id: string;
    question: string;
    createdAt: Date;
    article: { id: string; title: string } | null;
  }>;
}

export function EngagementQueue({
  pendingComments,
  newContactMessages,
  pendingFAQs,
  views,
  recentPendingComments,
  recentContactMessages,
  recentPendingFAQs,
}: EngagementQueueProps) {
  const trendPositive = views.trend > 0;
  const trendZero = views.trend === 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* ── Views Today ── */}
      <Card className="border-0 ring-1 ring-sky-500/20 bg-gradient-to-br from-sky-500/10 to-sky-500/5">
        <CardContent className="pt-4 pb-4 px-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-600/80">Views Today</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/15 flex items-center justify-center">
              <Eye className="h-4 w-4 text-sky-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-sky-700 dark:text-sky-400 tabular-nums leading-none">
            {views.today.toLocaleString()}
          </div>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 text-[10px] font-medium ${
              trendPositive ? "text-emerald-500" : trendZero ? "text-muted-foreground" : "text-red-500"
            }`}>
              {trendPositive && <TrendingUp className="h-3 w-3" />}
              {!trendPositive && !trendZero && <TrendingDown className="h-3 w-3" />}
              {trendPositive && "+"}{views.trend}% vs yesterday
            </div>
            <span className="text-[10px] text-sky-600/60 font-medium">{views.thisWeek.toLocaleString()} this week</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Pending Comments ── */}
      <Card className={`border-0 ring-1 ${pendingComments > 0 ? "ring-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5" : "ring-border/50 bg-muted/20"}`}>
        <CardContent className="pt-4 pb-3 px-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${pendingComments > 0 ? "text-orange-600/80" : "text-muted-foreground"}`}>
              Pending Comments
            </span>
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${pendingComments > 0 ? "bg-orange-500/15" : "bg-muted"}`}>
              <MessageSquare className={`h-4 w-4 ${pendingComments > 0 ? "text-orange-600" : "text-muted-foreground"}`} />
            </div>
          </div>
          <div className={`text-3xl font-bold tabular-nums leading-none ${pendingComments > 0 ? "text-orange-700 dark:text-orange-400" : "text-muted-foreground"}`}>
            {pendingComments}
          </div>
          {pendingComments > 0 && recentPendingComments.length > 0 ? (
            <div className="space-y-1">
              {recentPendingComments.slice(0, 2).map((c) => (
                <div key={c.id} className="text-[10px] text-muted-foreground line-clamp-1">
                  <span className="font-medium text-foreground/70">{c.author?.name ?? "Visitor"}</span>
                  {" — "}{c.content.substring(0, 40)}…
                </div>
              ))}
              <Link href="/articles?filter=pending-comments" className="flex items-center gap-0.5 text-[10px] text-orange-600 font-medium hover:underline mt-1">
                Review all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground">No pending comments</span>
          )}
        </CardContent>
      </Card>

      {/* ── New Contact Messages ── */}
      <Card className={`border-0 ring-1 ${newContactMessages > 0 ? "ring-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-500/5" : "ring-border/50 bg-muted/20"}`}>
        <CardContent className="pt-4 pb-3 px-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${newContactMessages > 0 ? "text-rose-600/80" : "text-muted-foreground"}`}>
              New Messages
            </span>
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${newContactMessages > 0 ? "bg-rose-500/15" : "bg-muted"}`}>
              <Mail className={`h-4 w-4 ${newContactMessages > 0 ? "text-rose-600" : "text-muted-foreground"}`} />
            </div>
          </div>
          <div className={`text-3xl font-bold tabular-nums leading-none ${newContactMessages > 0 ? "text-rose-700 dark:text-rose-400" : "text-muted-foreground"}`}>
            {newContactMessages}
          </div>
          {newContactMessages > 0 && recentContactMessages.length > 0 ? (
            <div className="space-y-1">
              {recentContactMessages.slice(0, 2).map((m) => (
                <div key={m.id} className="text-[10px] text-muted-foreground line-clamp-1">
                  <span className="font-medium text-foreground/70">{m.name}</span>
                  {" — "}{m.subject.substring(0, 35)}
                </div>
              ))}
              <Link href="/contact-messages" className="flex items-center gap-0.5 text-[10px] text-rose-600 font-medium hover:underline mt-1">
                Open inbox <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground">Inbox is clear</span>
          )}
        </CardContent>
      </Card>

      {/* ── Pending FAQs ── */}
      <Card className={`border-0 ring-1 ${pendingFAQs > 0 ? "ring-teal-500/30 bg-gradient-to-br from-teal-500/10 to-teal-500/5" : "ring-border/50 bg-muted/20"}`}>
        <CardContent className="pt-4 pb-3 px-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${pendingFAQs > 0 ? "text-teal-600/80" : "text-muted-foreground"}`}>
              FAQ Questions
            </span>
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${pendingFAQs > 0 ? "bg-teal-500/15" : "bg-muted"}`}>
              <HelpCircle className={`h-4 w-4 ${pendingFAQs > 0 ? "text-teal-600" : "text-muted-foreground"}`} />
            </div>
          </div>
          <div className={`text-3xl font-bold tabular-nums leading-none ${pendingFAQs > 0 ? "text-teal-700 dark:text-teal-400" : "text-muted-foreground"}`}>
            {pendingFAQs}
          </div>
          {pendingFAQs > 0 && recentPendingFAQs.length > 0 ? (
            <div className="space-y-1">
              {recentPendingFAQs.slice(0, 2).map((f) => (
                <div key={f.id} className="text-[10px] text-muted-foreground line-clamp-1">
                  <span className="font-medium text-foreground/70">{f.article?.title?.substring(0, 20) ?? "Article"}</span>
                  {" — "}{f.question.substring(0, 30)}…
                </div>
              ))}
              <Link href="/modonty/faq" className="flex items-center gap-0.5 text-[10px] text-teal-600 font-medium hover:underline mt-1">
                Answer questions <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground">No pending questions</span>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
