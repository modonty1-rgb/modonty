'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzeArticleSEO } from '../../analyzer';
import { SEOHealthScore } from '../../components/sections/seo-health-score';
import { InPageSEOChecklist } from '../../components/sections/in-page-seo-checklist';
import { OffPageSEOGuidance } from '../../components/sections/off-page-seo-guidance';
import { BestPracticesReference } from '../../components/sections/seo-best-practices-reference';
import { Article } from '../helpers/article-view-types';

interface ArticleSEOGuidanceProps {
  article: Article;
}

export function ArticleSEOGuidance({ article }: ArticleSEOGuidanceProps) {
  const scoreResult = useMemo(() => analyzeArticleSEO(article), [article]);

  // Convert categories to match SEOHealthScore expected format
  // Note: Old system had 'mobile' category, new system has 'social'
  const categoryBreakdown = useMemo(() => {
    if (!scoreResult) return null;
    return {
      metaTags: scoreResult.categories.metaTags,
      content: scoreResult.categories.content,
      images: scoreResult.categories.images,
      structuredData: scoreResult.categories.structuredData,
      technical: scoreResult.categories.technical,
      mobile: {
        ...scoreResult.categories.social,
        // Map social to mobile for compatibility
        maxScore: scoreResult.categories.social.maxScore,
      },
    };
  }, [scoreResult]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical SEO Guidance</CardTitle>
        <CardDescription>
          Analysis of your article against 2025 SEO best practices
        </CardDescription>
        <SEOHealthScore
          score={scoreResult?.percentage ?? 0}
          categories={categoryBreakdown}
          isLoading={false}
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="in-page" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="in-page">In-Page SEO</TabsTrigger>
            <TabsTrigger value="off-page">Off-Page SEO</TabsTrigger>
            <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          </TabsList>

          <TabsContent value="in-page" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">SEO analysis based on unified analyzer</p>
              <p className="text-xs mt-2">Score: {scoreResult.percentage}%</p>
            </div>
          </TabsContent>

          <TabsContent value="off-page" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Off-page SEO guidance coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="best-practices" className="mt-6">
            <BestPracticesReference />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
