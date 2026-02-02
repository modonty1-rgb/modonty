/**
 * Page Validator - Full Page Validation Orchestration
 *
 * Orchestrates complete page validation:
 * 1. Render page to HTML
 * 2. Extract structured data
 * 3. Validate with Adobe validator
 * 4. Analyze SEO elements
 * 5. Generate comprehensive report
 */

import { renderPageToHTML } from "./page-renderer";
import { extractStructuredData, combineExtractedData } from "./page-extractor";
import { validateExtractedData, validateJsonLdComplete } from "./jsonld-validator";
import { analyzePageSEO } from "./page-seo-analyzer";
import type {
  FullPageValidationResult,
  ValidationOptions,
  ValidationIssue,
  ExtractedData,
  PageType,
} from "./types";

/**
 * Validate full page
 */
export async function validateFullPage(
  pageType: PageType,
  identifier: string,
  options?: ValidationOptions
): Promise<FullPageValidationResult> {
  const timestamp = new Date().toISOString();
  const baseUrl = options?.baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    // Step 1: Render page to HTML
    let html: string;
    let rendered = false;
    let url: string;

    try {
      html = await renderPageToHTML(pageType, identifier, { baseUrl });
      url = getPageUrl(pageType, identifier, baseUrl);
      rendered = true;
    } catch (error) {
      // Fallback: generate from database (less accurate)
      html = await generateHTMLFromDatabase(pageType, identifier);
      url = getPageUrl(pageType, identifier, baseUrl);
      rendered = false;
    }

    // Step 2: Extract structured data
    const extracted: ExtractedData = await extractStructuredData(html);

    // Step 3: Validate structured data with Adobe validator
    const structuredDataValidation = await validateExtractedData(extracted, undefined);

    // Step 4: Analyze SEO elements
    const seoAnalysis = await analyzePageSEO(html, url);

    // Step 5: Combine results and generate issues
    const issues = generateValidationIssues(
      structuredDataValidation,
      seoAnalysis,
      extracted,
      options
    );

    // Calculate overall score (weighted: 60% schema, 40% SEO)
    const schemaScore = structuredDataValidation.adobe.valid ? 100 : 
      Math.max(0, 100 - (structuredDataValidation.adobe.errors.length * 10));
    const overallScore = Math.round(
      (schemaScore * 0.6) + (seoAnalysis.score * 0.4)
    );

    // Determine if page can be published
    const canPublish = 
      structuredDataValidation.adobe.errors.length === 0 &&
      structuredDataValidation.custom?.errors.length === 0 &&
      issues.critical.length === 0;

    return {
      url,
      pageType,
      rendered,
      structuredData: {
        extracted,
        validation: structuredDataValidation,
        schemaErrors: structuredDataValidation.adobe.errors.length,
        schemaWarnings: structuredDataValidation.adobe.warnings.length,
      },
      seo: seoAnalysis,
      timestamp,
      overallScore,
      canPublish,
      issues,
    };
  } catch (error) {
    // Return error result
    return {
      url: getPageUrl(pageType, identifier, baseUrl),
      pageType,
      rendered: false,
      structuredData: {
        extracted: {
          jsonLd: [],
          microdata: [],
          rdfa: [],
          all: [],
          locations: {},
          raw: { jsonLd: [], microdata: [], rdfa: [] },
        },
        validation: {
          adobe: {
            valid: false,
            errors: [
              {
                message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
                type: "VALIDATION_FAILED",
              },
            ],
            warnings: [],
            timestamp,
          },
          custom: {
            errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`],
            warnings: [],
            info: [],
          },
        },
        schemaErrors: 1,
        schemaWarnings: 0,
      },
      seo: {
        metaTags: { issues: [] },
        headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [], hierarchyValid: true, issues: [] },
        content: { wordCount: 0, paragraphCount: 0, linkCount: 0, imageCount: 0, issues: [] },
        images: { images: [], totalImages: 0, imagesWithAlt: 0, imagesWithoutAlt: 0, issues: [] },
        links: { internal: 0, external: 0, total: 0, broken: [], issues: [] },
        issues: [],
        score: 0,
      },
      timestamp,
      overallScore: 0,
      canPublish: false,
      issues: {
        critical: [
          {
            code: "VALIDATION_FAILED",
            category: "schema",
            severity: "critical",
            message: `Page validation failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        warnings: [],
        suggestions: [],
      },
    };
  }
}

/**
 * Get page URL for a given page type and identifier
 */
function getPageUrl(pageType: PageType, identifier: string, baseUrl: string): string {
  switch (pageType) {
    case "article":
      return `${baseUrl}/articles/${identifier}`;
    case "client":
      return `${baseUrl}/clients/${identifier}`;
    case "category":
      return `${baseUrl}/categories/${identifier}`;
    case "user":
      return `${baseUrl}/users/${identifier}`;
    default:
      return baseUrl;
  }
}

/**
 * Generate validation issues from all sources
 */
function generateValidationIssues(
  structuredDataValidation: Awaited<ReturnType<typeof validateExtractedData>>,
  seoAnalysis: Awaited<ReturnType<typeof analyzePageSEO>>,
  extracted: ExtractedData,
  options?: ValidationOptions
): {
  critical: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
} {
  const critical: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const suggestions: ValidationIssue[] = [];

  // Schema validation errors (critical)
  for (const error of structuredDataValidation.adobe.errors) {
    critical.push({
      code: error.type || "SCHEMA_ERROR",
      category: "schema",
      severity: "critical",
      message: error.message,
      path: error.path,
      property: error.property,
      fix: "Fix schema.org structured data according to validation errors",
      location: extracted.locations[error.property || ""],
    });
  }

  // Business validation errors (critical)
  for (const error of structuredDataValidation.custom?.errors || []) {
    critical.push({
      code: "BUSINESS_RULE_ERROR",
      category: "structured-data",
      severity: "critical",
      message: error,
      fix: "Fix structured data according to business rules",
    });
  }

  // Schema validation warnings
  for (const warning of structuredDataValidation.adobe.warnings) {
    warnings.push({
      code: warning.property || "SCHEMA_WARNING",
      category: "schema",
      severity: "warning",
      message: warning.message,
      path: warning.path,
      property: warning.property,
      fix: warning.recommendation || "Review schema.org guidelines",
      location: extracted.locations[warning.property || ""],
    });
  }

  // Business validation warnings
  for (const warning of structuredDataValidation.custom?.warnings || []) {
    warnings.push({
      code: "BUSINESS_RULE_WARNING",
      category: "structured-data",
      severity: "warning",
      message: warning,
      fix: "Review business rules for structured data",
    });
  }

  // Map SEOIssue category to ValidationIssue category
  const mapCategory = (category: string): ValidationIssue["category"] => {
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

  // SEO errors (critical)
  for (const issue of seoAnalysis.issues) {
    if (issue.severity === "error") {
      critical.push({
        code: issue.code,
        category: mapCategory(issue.category),
        severity: "critical",
        message: issue.message,
        fix: issue.fix,
      });
    } else if (issue.severity === "warning") {
      warnings.push({
        code: issue.code,
        category: mapCategory(issue.category),
        severity: "warning",
        message: issue.message,
        fix: issue.fix,
      });
    } else {
      suggestions.push({
        code: issue.code,
        category: mapCategory(issue.category),
        severity: "suggestion",
        message: issue.message,
        fix: issue.fix,
      });
    }
  }

  // No structured data found (warning, not critical)
  if (extracted.all.length === 0) {
    warnings.push({
      code: "NO_STRUCTURED_DATA",
      category: "structured-data",
      severity: "warning",
      message: "No structured data (JSON-LD, Microdata, or RDFa) found on page",
      fix: "Add structured data to improve search engine visibility",
    });
  }

  return { critical, warnings, suggestions };
}

/**
 * Generate HTML from database as fallback
 * This is a simplified version for when page rendering fails
 */
async function generateHTMLFromDatabase(
  pageType: PageType,
  identifier: string
): Promise<string> {
  const { db } = await import("@/lib/db");
  
  let html = "<!DOCTYPE html><html><head>";

  try {
    switch (pageType) {
      case "article": {
        const article = await db.article.findFirst({
          where: { slug: identifier },
          include: {
            author: true,
            client: true,
            category: true,
            featuredImage: true,
          },
        });

        if (!article) {
          throw new Error(`Article not found: ${identifier}`);
        }

        html += `<title>${escapeHtml(article.title)}</title>`;
        html += `<meta name="description" content="${escapeHtml(article.seoDescription || article.excerpt || "")}">`;
        if (article.jsonLdStructuredData) {
          html += `<script type="application/ld+json">${article.jsonLdStructuredData}</script>`;
        }
        html += "</head><body>";
        html += `<h1>${escapeHtml(article.title)}</h1>`;
        html += `<div>${article.content}</div>`;
        break;
      }
      case "client": {
        const client = await db.client.findFirst({
          where: { slug: identifier },
        });

        if (!client) {
          throw new Error(`Client not found: ${identifier}`);
        }

        html += `<title>${escapeHtml(client.name)}</title>`;
        html += `<meta name="description" content="${escapeHtml(client.seoDescription || "")}">`;
        html += "</head><body>";
        html += `<h1>${escapeHtml(client.name)}</h1>`;
        break;
      }
      case "category": {
        const category = await db.category.findFirst({
          where: { slug: identifier },
        });

        if (!category) {
          throw new Error(`Category not found: ${identifier}`);
        }

        html += `<title>${escapeHtml(category.name)}</title>`;
        html += `<meta name="description" content="${escapeHtml(category.seoDescription || category.description || "")}">`;
        html += "</head><body>";
        html += `<h1>${escapeHtml(category.name)}</h1>`;
        break;
      }
      case "user": {
        const user = await db.user.findUnique({
          where: { id: identifier },
        });

        if (!user) {
          // Try author
          const author = await db.author.findFirst({
            where: { slug: identifier },
          });

          if (!author) {
            throw new Error(`User/Author not found: ${identifier}`);
          }

          html += `<title>${escapeHtml(author.name)}</title>`;
          html += "</head><body>";
          html += `<h1>${escapeHtml(author.name)}</h1>`;
        } else {
          html += `<title>${escapeHtml(user.name || "User")}</title>`;
          html += "</head><body>";
          html += `<h1>${escapeHtml(user.name || "User")}</h1>`;
        }
        break;
      }
    }

    html += "</body></html>";
    return html;
  } catch (error) {
    throw new Error(
      `Failed to generate HTML from database: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
