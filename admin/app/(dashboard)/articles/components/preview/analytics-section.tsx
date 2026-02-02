'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Clock, TrendingUp, Activity } from 'lucide-react';

interface AnalyticsData {
  viewCount: number;
  avgTimeOnPage: number | null;
  avgScrollDepth: number | null;
  bounceRate: number;
  avgLCP: number | null;
  avgCLS: number | null;
  avgINP: number | null;
}

interface AnalyticsSectionProps {
  articleId: string;
}

export function AnalyticsSection({ articleId }: AnalyticsSectionProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/articles/${articleId}/analytics`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.statusText}`);
        }
        
        const data: AnalyticsData = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [articleId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 border-t">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="border-t mt-12 pt-8">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Article performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error || 'No analytics data available'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number | null): string => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const formatPercentage = (value: number | null): string => {
    if (value === null) return 'N/A';
    return `${Math.round(value)}%`;
  };

  return (
    <div className="border-t mt-12 pt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Analytics
          </CardTitle>
          <CardDescription>Article performance and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>Total Views</span>
              </div>
              <div className="text-2xl font-bold">{analytics.viewCount}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Avg. Time on Page</span>
              </div>
              <div className="text-2xl font-bold">{formatTime(analytics.avgTimeOnPage)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Scroll Depth</span>
              </div>
              <div className="text-2xl font-bold">{formatPercentage(analytics.avgScrollDepth)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Bounce Rate</span>
              </div>
              <div className="text-2xl font-bold">
                <Badge variant={analytics.bounceRate > 50 ? 'destructive' : 'default'}>
                  {formatPercentage(analytics.bounceRate)}
                </Badge>
              </div>
            </div>
          </div>

          {(analytics.avgLCP !== null || analytics.avgCLS !== null || analytics.avgINP !== null) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold mb-4">Core Web Vitals</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {analytics.avgLCP !== null && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">LCP (Largest Contentful Paint)</div>
                    <div className="text-lg font-semibold">
                      {analytics.avgLCP.toFixed(2)}s
                      <Badge
                        variant={analytics.avgLCP < 2.5 ? 'default' : analytics.avgLCP < 4 ? 'outline' : 'destructive'}
                        className="ml-2"
                      >
                        {analytics.avgLCP < 2.5 ? 'Good' : analytics.avgLCP < 4 ? 'Needs Improvement' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                )}

                {analytics.avgCLS !== null && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">CLS (Cumulative Layout Shift)</div>
                    <div className="text-lg font-semibold">
                      {analytics.avgCLS.toFixed(3)}
                      <Badge
                        variant={analytics.avgCLS < 0.1 ? 'default' : analytics.avgCLS < 0.25 ? 'outline' : 'destructive'}
                        className="ml-2"
                      >
                        {analytics.avgCLS < 0.1 ? 'Good' : analytics.avgCLS < 0.25 ? 'Needs Improvement' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                )}

                {analytics.avgINP !== null && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">INP (Interaction to Next Paint)</div>
                    <div className="text-lg font-semibold">
                      {analytics.avgINP.toFixed(0)}ms
                      <Badge
                        variant={analytics.avgINP < 200 ? 'default' : analytics.avgINP < 500 ? 'outline' : 'destructive'}
                        className="ml-2"
                      >
                        {analytics.avgINP < 200 ? 'Good' : analytics.avgINP < 500 ? 'Needs Improvement' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
