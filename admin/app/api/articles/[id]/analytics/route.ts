import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/articles/[id]/analytics
 * Get analytics data for an article
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if input is valid ObjectId (24 hex characters)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let articleId = id;
    if (!isObjectId) {
      // It's a slug - find article by slug first
      const articleBySlug = await db.article.findFirst({
        where: { slug: id },
        select: { id: true },
      });
      
      if (!articleBySlug) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      
      articleId = articleBySlug.id;
    }

    // Get analytics aggregations
    const [viewCount, bouncedCount, timeOnPageData, scrollDepthData, coreWebVitals] = await Promise.all([
      // Total view count
      db.analytics.count({
        where: { articleId },
      }),
      
      // Count bounced views
      db.analytics.count({
        where: {
          articleId,
          bounced: true,
        },
      }),
      
      // Average time on page
      db.analytics.aggregate({
        where: {
          articleId,
          timeOnPage: { not: null },
        },
        _avg: {
          timeOnPage: true,
        },
      }),
      
      // Average scroll depth
      db.analytics.aggregate({
        where: {
          articleId,
          scrollDepth: { not: null },
        },
        _avg: {
          scrollDepth: true,
        },
      }),
      
      // Core Web Vitals averages
      db.analytics.aggregate({
        where: {
          articleId,
          OR: [
            { lcp: { not: null } },
            { cls: { not: null } },
            { inp: { not: null } },
          ],
        },
        _avg: {
          lcp: true,
          cls: true,
          inp: true,
        },
      }),
    ]);

    const totalViews = viewCount || 0;
    const bounceRate = totalViews > 0 ? (bouncedCount / totalViews) * 100 : 0;

    const analyticsData = {
      viewCount: totalViews,
      avgTimeOnPage: timeOnPageData._avg.timeOnPage,
      avgScrollDepth: scrollDepthData._avg.scrollDepth,
      bounceRate: Math.round(bounceRate),
      avgLCP: coreWebVitals._avg.lcp,
      avgCLS: coreWebVitals._avg.cls,
      avgINP: coreWebVitals._avg.inp,
    };

    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    console.error('Error fetching article analytics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
