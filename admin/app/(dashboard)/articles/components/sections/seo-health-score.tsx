'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CheckCircle2, AlertCircle, Info, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArticleSEOCategory } from '../../analyzer';

type CategoryScore = ArticleSEOCategory;

interface SEOHealthScoreProps {
  score: number;
  categories: {
    metaTags: CategoryScore;
    content: CategoryScore;
    images: CategoryScore;
    structuredData: CategoryScore;
    technical: CategoryScore;
    mobile: CategoryScore;
  } | null;
  isLoading?: boolean;
}

export function SEOHealthScore({ score, categories, isLoading }: SEOHealthScoreProps) {
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

  const getCategoryIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (percentage >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <Info className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Overall SEO Score</h3>
              <p className="text-sm text-muted-foreground">
                Based on 2025 SEO best practices
              </p>
            </div>
            <div className="text-right">
              <div className={cn('text-3xl font-bold', getScoreColor(score))}>
                {isLoading ? '...' : `${score}%`}
              </div>
              <Badge variant={getScoreVariant(score)} className="mt-1">
                {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>

          <Progress value={score} className="h-2" />

          {/* Category Breakdown */}
          {categories && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <CategoryItem
                label="Meta Tags"
                score={categories.metaTags}
                icon={getCategoryIcon(categories.metaTags.percentage)}
              />
              <CategoryItem
                label="Content"
                score={categories.content}
                icon={getCategoryIcon(categories.content.percentage)}
              />
              <CategoryItem
                label="Images"
                score={categories.images}
                icon={getCategoryIcon(categories.images.percentage)}
              />
              <CategoryItem
                label="Structured Data"
                score={categories.structuredData}
                icon={getCategoryIcon(categories.structuredData.percentage)}
              />
              <CategoryItem
                label="Technical"
                score={categories.technical}
                icon={getCategoryIcon(categories.technical.percentage)}
              />
              <CategoryItem
                label="Mobile"
                score={categories.mobile}
                icon={getCategoryIcon(categories.mobile.percentage)}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryItem({
  label,
  score,
  icon,
}: {
  label: string;
  score: CategoryScore;
  icon: React.ReactNode;
}) {
  const items = score.items ?? [];
  const failed = items.filter((i) => !i.passed);

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "flex items-center justify-between p-3 border rounded-lg cursor-default",
            "hover:bg-muted/50 transition-colors",
          )}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{label}</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">{score.percentage}%</div>
            <div className="text-xs text-muted-foreground">
              {score.passed}/{score.total}
            </div>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80 p-4 space-y-3 bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800"
        side="bottom"
        align="start"
      >
        <div>
          <h4 className="text-sm font-semibold mb-1">{label} — {score.passed}/{score.total}</h4>
          <p className="text-xs text-muted-foreground">
            {failed.length > 0
              ? "What's incomplete and why:"
              : "All checks passed."}
          </p>
        </div>
        {items.length > 0 && (
          <ul className="space-y-2 text-sm">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                {item.passed ? (
                  <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <X className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <span>
                  <span className={cn(!item.passed && "font-medium")}>{item.label}</span>
                  {item.reason != null && (
                    <span className={cn(
                      "block text-xs mt-0.5",
                      item.passed ? "text-muted-foreground" : "text-amber-800 dark:text-amber-200",
                    )}>
                      {item.reason}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
