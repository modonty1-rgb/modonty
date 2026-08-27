/**
 * Page Renderer - Full Page Validation
 *
 * Server-side render Next.js pages to HTML for comprehensive validation.
 * Supports articles, clients, categories, and user pages.
 */

import { entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { db } from "@/lib/db";
import type { PageType } from "./types";

export interface RenderOptions {
  /** Settings.siteUrl, from `loadSiteUrl()`. Required — see getPageUrl below. */
  baseUrl: string;
  includeMetadata?: boolean;
}

/**
 * Get page URL for a given page type and identifier
 */
function getPageUrl(
  pageType: PageType,
  identifier: string,
  /** From `loadSiteUrl()`. Required — a default would render and validate the wrong host. */
  baseUrl: string
): string {
  const siteUrl = baseUrl;
  
  switch (pageType) {
    case "article":
      return entityUrl("articles", identifier, siteUrl);
    case "client":
      return entityUrl("clients", identifier, siteUrl);
    case "category":
      return entityUrl("categories", identifier, siteUrl);
    case "user":
      return entityUrl("users", identifier, siteUrl);
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
  options: RenderOptions
): Promise<string> {
  const url = getPageUrl(pageType, identifier, options.baseUrl);
  
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
    // The same swap `page-validator` carried: a failed fetch used to return a stand-in built
    // from DB columns — a title, a description, and none of the tags a validator exists to
    // check. Whatever consumed the result then judged that stand-in as the page.
    //
    // "The site did not answer" is not "the page looks like this". Rethrow so the caller
    // knows it never saw the page, instead of being handed something that resembles one.
    throw error;
  }
}

// `generateHTMLFromDatabase` was deleted on 27 Aug 2026 with the fallback that called it.
// It assembled a title, a description and one JSON-LD block — no canonical, no robots, no
// hreflang, no Open Graph — and the validator judged that as if it were the page. A page
// we could not render is not a page with less markup; leaving the builder here would only
// invite the same swap back.

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
