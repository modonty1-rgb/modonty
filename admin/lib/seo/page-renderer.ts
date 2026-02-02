/**
 * Page Renderer - Full Page Validation
 *
 * Server-side render Next.js pages to HTML for comprehensive validation.
 * Supports articles, clients, categories, and user pages.
 */

import { db } from "@/lib/db";
import type { PageType } from "./types";

export interface RenderOptions {
  baseUrl?: string;
  includeMetadata?: boolean;
}

/**
 * Get page URL for a given page type and identifier
 */
function getPageUrl(
  pageType: PageType,
  identifier: string,
  baseUrl?: string
): string {
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  switch (pageType) {
    case "article":
      return `${siteUrl}/articles/${identifier}`;
    case "client":
      return `${siteUrl}/clients/${identifier}`;
    case "category":
      return `${siteUrl}/categories/${identifier}`;
    case "user":
      return `${siteUrl}/users/${identifier}`;
    default:
      throw new Error(`Unknown page type: ${pageType}`);
  }
}

/**
 * Render page to HTML by fetching from live URL
 * Best practice: Use actual rendered HTML for accurate validation
 */
export async function renderPageToHTML(
  pageType: PageType,
  identifier: string,
  options?: RenderOptions
): Promise<string> {
  const url = getPageUrl(pageType, identifier, options?.baseUrl);
  
  try {
    // Fetch from live URL (best for accurate validation)
    // In production, this could be the actual production URL
    // In development, use localhost if dev server is running
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Modonty-SEO-Validator/1.0",
      },
      next: { revalidate: 0 }, // Always fetch fresh
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch page: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();
    return html;
  } catch (error) {
    // Fallback: Try to generate HTML from database data
    if (error instanceof Error && error.message.includes("fetch")) {
      return await generateHTMLFromDatabase(pageType, identifier);
    }
    throw error;
  }
}

/**
 * Generate HTML from database data as fallback
 * This is less accurate but works when page isn't accessible
 */
async function generateHTMLFromDatabase(
  pageType: PageType,
  identifier: string
): Promise<string> {
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

        html += `<title>${article.title}</title>`;
        html += `<meta name="description" content="${article.seoDescription || article.excerpt || ""}">`;
        if (article.jsonLdStructuredData) {
          html += `<script type="application/ld+json">${article.jsonLdStructuredData}</script>`;
        }
        html += "</head><body>";
        html += `<h1>${article.title}</h1>`;
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

        html += `<title>${client.name}</title>`;
        html += `<meta name="description" content="${client.seoDescription || ""}">`;
        html += "</head><body>";
        html += `<h1>${client.name}</h1>`;
        break;
      }
      case "category": {
        const category = await db.category.findFirst({
          where: { slug: identifier },
        });

        if (!category) {
          throw new Error(`Category not found: ${identifier}`);
        }

        html += `<title>${category.name}</title>`;
        html += `<meta name="description" content="${category.seoDescription || category.description || ""}">`;
        html += "</head><body>";
        html += `<h1>${category.name}</h1>`;
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

          html += `<title>${author.name}</title>`;
          html += "</head><body>";
          html += `<h1>${author.name}</h1>`;
        } else {
          html += `<title>${user.name || "User"}</title>`;
          html += "</head><body>";
          html += `<h1>${user.name || "User"}</h1>`;
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
 * Extract rendered HTML from URL
 */
export async function extractRenderedHTML(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Modonty-SEO-Validator/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch URL: ${response.status} ${response.statusText}`
      );
    }

    return await response.text();
  } catch (error) {
    throw new Error(
      `Failed to extract HTML: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
