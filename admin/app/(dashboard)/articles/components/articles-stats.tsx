"use client";

import { useState } from "react";
import { AnalticCard } from "@/components/shared/analtic-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart3,
  FileText,
  CheckCircle2,
  Edit,
  Clock,
  Archive,
  CalendarDays,
  TrendingUp,
  Stethoscope,
} from "lucide-react";

interface ArticlesStatsProps {
  stats: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
    archived: number;
    publishedThisMonth: number;
    averageSEO: number;
    averagePublishedSEO: number;
    averageDraftSEO: number;
    lowSEOCount: number;
    highSEOCount: number;
    needsImprovementCount: number;
  };
}

export function ArticlesStats({ stats }: ArticlesStatsProps) {
  const [open, setOpen] = useState(false);

  const seoColor = stats.averageSEO >= 80
    ? "text-emerald-500"
    : stats.averageSEO >= 60
      ? "text-amber-500"
      : "text-red-500";

  return (
    <div className="hidden md:flex items-center gap-1.5 flex-wrap">
      <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
        <FileText className="h-3 w-3 text-blue-500" />
        <span className="font-semibold">{stats.total}</span>
        <span className="text-muted-foreground">total</span>
      </Badge>
      <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        <span className="font-semibold">{stats.published}</span>
        <span className="text-muted-foreground">published</span>
      </Badge>
      <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
        <Edit className="h-3 w-3 text-amber-500" />
        <span className="font-semibold">{stats.draft}</span>
        <span className="text-muted-foreground">drafts</span>
      </Badge>
      <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
        <Stethoscope className={`h-3 w-3 ${seoColor}`} />
        <span className="font-semibold">{stats.averageSEO}%</span>
        <span className="text-muted-foreground">SEO</span>
      </Badge>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-muted-foreground hover:text-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="text-xs">Details</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Article Statistics</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <AnalticCard title="Total Articles" value={stats.total} icon="FileText" variant="compact" />
              <AnalticCard title="Published" value={stats.published} icon="CheckCircle2" variant="compact" />
              <AnalticCard title="Drafts" value={stats.draft} icon="Edit" variant="compact" />
              <AnalticCard title="Scheduled" value={stats.scheduled} icon="Clock" variant="compact" />
              <AnalticCard title="Archived" value={stats.archived} icon="Archive" variant="compact" />
              <AnalticCard title="This Month" value={stats.publishedThisMonth} icon="Calendar" variant="compact" />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">SEO Breakdown</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Overall SEO</span>
                    <Badge
                      variant={stats.averageSEO >= 80 ? "default" : stats.averageSEO >= 60 ? "secondary" : "destructive"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {stats.averageSEO >= 80 ? "Excellent" : stats.averageSEO >= 60 ? "Good" : "Needs Work"}
                    </Badge>
                  </div>
                  <div className="text-xl font-bold">{stats.averageSEO}%</div>
                  <p className="text-[10px] text-muted-foreground">Average across all articles</p>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Published SEO</span>
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div className="text-xl font-bold">{stats.averagePublishedSEO}%</div>
                  <p className="text-[10px] text-muted-foreground">
                    {stats.published} published article{stats.published !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">High SEO Score</span>
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-green-600">&ge;80%</Badge>
                  </div>
                  <div className="text-xl font-bold text-green-600">{stats.highSEOCount}</div>
                  <p className="text-[10px] text-muted-foreground">Excellent SEO</p>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Needs Improvement</span>
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">&lt;60%</Badge>
                  </div>
                  <div className="text-xl font-bold text-red-600">{stats.lowSEOCount}</div>
                  <p className="text-[10px] text-muted-foreground">Requires attention</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
