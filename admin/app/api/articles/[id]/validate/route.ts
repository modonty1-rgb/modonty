import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractRenderedHTML } from '@/lib/seo/page-renderer';

/**
 * POST /api/articles/[id]/validate
 * Validates article from DB only (loads article by ID)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Load article from DB
    const article = await db.article.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        faqs: {
          orderBy: {
            position: 'asc',
          },
        },
        featuredImage: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Use request origin so we fetch the same server (avoids env mismatch, e.g. localhost vs production)
    const baseUrl =
      request.nextUrl.origin ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";
    const previewUrl = `${baseUrl}/articles/preview/${article.id}`;
    
    let html: string;
    let rendered = false;
    
    try {
      // Fetch actual rendered HTML from preview page
      html = await extractRenderedHTML(previewUrl);
      rendered = true;
    } catch (error) {
      // Fallback: If preview page not accessible, return error
      console.error('Failed to fetch preview page HTML:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch preview page HTML',
          message: error instanceof Error ? error.message : String(error),
          hint: 'Make sure preview page is accessible and server is running',
        },
        { status: 500 }
      );
    }

    // Use the existing validation infrastructure
    const { extractStructuredData } = await import('@/lib/seo/page-extractor');
    const { validateExtractedData } = await import('@/lib/seo/jsonld-validator');
    const { analyzePageSEO } = await import('@/lib/seo/page-seo-analyzer');

    // Extract structured data from rendered HTML
    const extracted = await extractStructuredData(html);

    // Validate structured data
    const structuredDataValidation = await validateExtractedData(extracted, undefined);

    // Analyze SEO using preview URL
    const url = previewUrl;
    const seoAnalysis = await analyzePageSEO(html, url);

    // Generate validation issues
    const critical: any[] = [];
    const warnings: any[] = [];
    const suggestions: any[] = [];

    // Schema validation errors (critical)
    for (const error of structuredDataValidation.adobe.errors) {
      critical.push({
        code: error.type || 'SCHEMA_ERROR',
        category: 'schema',
        severity: 'critical',
        message: error.message,
        path: error.path,
        property: error.property,
        fix: 'Fix schema.org structured data according to validation errors',
      });
    }

    // Business validation errors (critical)
    for (const error of structuredDataValidation.custom?.errors || []) {
      critical.push({
        code: 'BUSINESS_RULE_ERROR',
        category: 'structured-data',
        severity: 'critical',
        message: error,
        fix: 'Fix structured data according to business rules',
      });
    }

    // Schema validation warnings
    for (const warning of structuredDataValidation.adobe.warnings) {
      warnings.push({
        code: warning.property || 'SCHEMA_WARNING',
        category: 'schema',
        severity: 'warning',
        message: warning.message,
        path: warning.path,
        property: warning.property,
        fix: warning.recommendation || 'Review schema.org guidelines',
      });
    }

    // Map SEOIssue category to ValidationIssue category
    const mapCategory = (category: string): "schema" | "seo" | "content" | "media" | "structured-data" => {
      switch (category) {
        case "meta":
        case "link":
          return "seo";
        case "image":
          return "media";
        case "content":
        case "heading":
          return "content";
        case "structure":
          return "structured-data";
        default:
          return "seo";
      }
    };

    // SEO issues with proper category mapping
    for (const issue of seoAnalysis.issues) {
      if (issue.severity === 'error') {
        critical.push({
          code: issue.code,
          category: mapCategory(issue.category),
          severity: 'critical',
          message: issue.message,
          fix: issue.fix,
        });
      } else if (issue.severity === 'warning') {
        warnings.push({
          code: issue.code,
          category: mapCategory(issue.category),
          severity: 'warning',
          message: issue.message,
          fix: issue.fix,
        });
      } else {
        suggestions.push({
          code: issue.code,
          category: mapCategory(issue.category),
          severity: 'suggestion',
          message: issue.message,
          fix: issue.fix,
        });
      }
    }

    // Calculate overall score
    const schemaScore = structuredDataValidation.adobe.valid ? 100 : 
      Math.max(0, 100 - (structuredDataValidation.adobe.errors.length * 10));
    const overallScore = Math.round(
      (schemaScore * 0.6) + (seoAnalysis.score * 0.4)
    );

    // Determine if page can be published
    const canPublish = 
      structuredDataValidation.adobe.errors.length === 0 &&
      structuredDataValidation.custom?.errors.length === 0 &&
      critical.length === 0;

    const result = {
      url,
      pageType: 'article',
      rendered,
      structuredData: {
        extracted,
        validation: structuredDataValidation,
        schemaErrors: structuredDataValidation.adobe.errors.length,
        schemaWarnings: structuredDataValidation.adobe.warnings.length,
      },
      seo: seoAnalysis,
      timestamp: new Date().toISOString(),
      overallScore,
      canPublish,
      issues: {
        critical,
        warnings,
        suggestions,
      },
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Article validation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to validate article',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}