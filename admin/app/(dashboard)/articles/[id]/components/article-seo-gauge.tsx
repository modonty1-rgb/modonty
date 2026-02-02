"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { analyzeArticleSEO } from "../../analyzer";
import { Article } from "../helpers/article-view-types";

interface ArticleSeoGaugeProps {
  article: Article;
}

export function ArticleSeoGauge({ article }: ArticleSeoGaugeProps) {
  const scoreResult = useMemo(() => analyzeArticleSEO(article), [article]);
  const score = scoreResult.percentage;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">SEO Score</span>
        <Badge variant={getScoreVariant(score)} className="text-sm">
          {score}%
        </Badge>
      </div>
      <Progress value={score} className="h-2" />
      <div className={cn('text-xs text-center', getScoreColor(score))}>
        {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
      </div>
    </div>
  );
}
