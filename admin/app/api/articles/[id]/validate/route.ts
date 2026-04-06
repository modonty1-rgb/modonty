import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        seoTitle: true,
        seoDescription: true,
        canonicalUrl: true,
        jsonLdStructuredData: true,
        tags: { include: { tag: true } },
        faqs: { orderBy: { position: 'asc' } },
        featuredImage: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Always validate from DB data — most accurate source of truth
    // (live page may have stale cache)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
    const previewUrl = `${siteUrl}/articles/${article.slug}`;
    const jsonLd = article.jsonLdStructuredData || "";
    const desc = article.seoDescription || "";
    const canonical = article.canonicalUrl || "";
    const ogTitle = article.seoTitle || article.title;
    const imgUrl = article.featuredImage?.url || "";

    const html = `<!DOCTYPE html><html lang="ar" dir="rtl">
<head>
<title>${article.title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index, follow">
${canonical ? `<link rel="canonical" href="${canonical}">` : ""}
${ogTitle ? `<meta property="og:title" content="${ogTitle}">` : ""}
${desc ? `<meta property="og:description" content="${desc}">` : ""}
${imgUrl ? `<meta property="og:image" content="${imgUrl}">` : ""}
${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ""}
</head>
<body>
<h1>${article.title}</h1>
<article>${article.content}</article>
</body></html>`;
    const rendered = false;

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