"use client";

import { useState } from "react";
import { ar } from "@/lib/ar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ArticleCard } from "./article-card";
import { FileText, CheckCircle, List } from "lucide-react";
import type { ArticleWithAllData } from "../helpers/article-queries";

interface ArticlesPageClientProps {
  pendingArticles: ArticleWithAllData[];
  publishedArticles: ArticleWithAllData[];
  allArticles: ArticleWithAllData[];
  pendingCount: number;
  initialTab: string;
  siteUrl: string;
}

export function ArticlesPageClient({
  pendingArticles,
  publishedArticles,
  allArticles,
  pendingCount,
  initialTab,
  siteUrl,
}: ArticlesPageClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    {
      id: "pending",
      label: ar.articles.pendingApprovalTab,
      count: pendingCount,
      icon: FileText,
      articles: pendingArticles,
    },
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

  const activeTabData = tabs.find((t) => t.id === activeTab) || tabs[0];

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

      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        {activeTabData.articles.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {activeTab === "pending"
                  ? ar.articles.noPending
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
