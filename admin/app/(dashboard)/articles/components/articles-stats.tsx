"use client";

import { useState } from "react";
import { AnalticCard } from "@/components/shared/analtic-card";
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { SEOScoreOverall } from "@/components/shared/seo-doctor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle>Statistics</CardTitle>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Main Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <AnalticCard
                title="Total Articles"
                value={stats.total}
                icon="FileText"
                description="All articles in the system"
              />
              <AnalticCard
                title="Published"
                value={stats.published}
                icon="CheckCircle2"
                description="Live articles"
              />
              <AnalticCard
                title="Drafts"
                value={stats.draft}
                icon="Edit"
                description="In progress"
              />
              <AnalticCard
                title="Archived"
                value={stats.archived}
                icon="Archive"
                description="Archived articles"
              />
              <AnalticCard
                title="This Month"
                value={stats.publishedThisMonth}
                icon="Calendar"
                description="Published this month"
              />
              <SEOScoreOverall value={stats.averageSEO} />
            </div>

            {/* Enhanced SEO Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall SEO Health */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Overall SEO Health</h3>
                  <Badge
                    variant={stats.averageSEO >= 80 ? "default" : stats.averageSEO >= 60 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {stats.averageSEO >= 80 ? "Excellent" : stats.averageSEO >= 60 ? "Good" : "Needs Work"}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{stats.averageSEO}%</div>
                <p className="text-xs text-muted-foreground mt-1">Average across all articles</p>
              </div>

              {/* Published SEO Health */}
              {stats.published > 0 && (
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Published SEO</h3>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold">{stats.averagePublishedSEO}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.published} published article{stats.published !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {/* High SEO Count */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">High SEO Score</h3>
                  <Badge variant="default" className="text-xs bg-green-600">
                    ≥80%
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.highSEOCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Articles with excellent SEO</p>
              </div>

              {/* Low SEO Count */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Needs Improvement</h3>
                  <Badge variant="destructive" className="text-xs">
                    &lt;60%
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-red-600">{stats.lowSEOCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Articles requiring attention</p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
