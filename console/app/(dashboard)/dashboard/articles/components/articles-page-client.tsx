"use client";

import { useState } from "react";
import { ar } from "@/lib/ar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ArticleCard } from "./article-card";
import { FileText, CheckCircle, List, CalendarClock } from "lucide-react";
import type { ArticleWithAllData } from "../helpers/article-queries";

interface ArticlesPageClientProps {
  pendingArticles: ArticleWithAllData[];
  publishedArticles: ArticleWithAllData[];
  allArticles: ArticleWithAllData[];
  pendingCount: number;
  initialTab: string;
  siteUrl: string;
  /** Admin switch — off hides the «مجدولة» tab from this client entirely. */
  showSchedule: boolean;
}

export function ArticlesPageClient({
  pendingArticles,
  publishedArticles,
  allArticles,
  pendingCount,
  initialTab,
  siteUrl,
  showSchedule,
}: ArticlesPageClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const scheduledArticles = allArticles.filter((a) => a.status === "SCHEDULED");

  const tabs = [
    {
      id: "pending",
      label: ar.articles.pendingApprovalTab,
      count: pendingCount,
      icon: FileText,
      articles: pendingArticles,
    },
    // Dropped entirely when the switch is off — not rendered-and-hidden, so the count of
    // unpublished work never leaks through the tab strip either.
    ...(showSchedule
      ? [
          {
            id: "scheduled",
            label: ar.articles.scheduledTab ?? "مجدولة",
            count: scheduledArticles.length,
            icon: CalendarClock,
            articles: scheduledArticles,
          },
        ]
      : []),
    {
      id: "published",
      label: ar.articles.published,
      icon: CheckCircle,
      articles: publishedArticles,
    },
    {
      id: "all",
      label: ar.articles.allArticles,
      icon: List,
      articles: allArticles,
    },
  ];

  // `?tab=scheduled` in a bookmarked link must not resurrect a hidden tab — an unknown
  // id falls through to the first tab, which is what this guard makes it do.
  const activeTabData = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {ar.nav.articles}
        </h1>
        <p className="text-muted-foreground mt-1">
          {ar.articles.manageApproveArticles}
        </p>
      </div>

      {/* The four labels do not fit a 390px phone: as a plain flex row they were being
          squeezed until "بانتظار الموافقة" wrapped and the last tab was cut to "ال"
          (Khalid 2026-08-04). Now the strip scrolls sideways and every tab keeps its
          full width. The divider is drawn behind the tabs so the active tab's accent
          sits on top of it — the old `-mb-px` would overflow a scroll container. */}
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border"
        />
        {/* Scrollbar hidden: the partially visible last tab is the affordance, and a
            desktop scrollbar under a 1px divider reads as a rendering glitch. */}
        <div className="flex gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {activeTabData.articles.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {activeTab === "pending"
                  ? ar.articles.noPending
                  : activeTab === "scheduled"
                    ? ar.articles.noScheduled ?? "لا توجد مقالات مجدولة. ستظهر هنا بعد موافقتك."
                    : activeTab === "published"
                      ? ar.articles.noPublished
                      : ar.articles.noArticlesYet}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeTabData.articles.map((article) => (
              <ArticleCard key={article.id} article={article} siteUrl={siteUrl} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
