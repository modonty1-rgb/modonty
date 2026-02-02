/**
 * Page SEO Analyzer - Comprehensive SEO Analysis
 *
 * Analyzes meta tags, headings, content quality, images, and links
 * to provide comprehensive SEO insights.
 */

import type {
  SEOAnalysis,
  MetaTagAnalysis,
  HeadingAnalysis,
  ContentAnalysis,
  ImageAnalysis,
  LinkAnalysis,
  SEOIssue,
} from "./types";

/**
 * Analyze page SEO from HTML
 */
export async function analyzePageSEO(html: string, url: string): Promise<SEOAnalysis> {
  const metaTags = analyzeMetaTags(html);
  const headings = analyzeHeadings(html);
  const content = analyzeContent(html);
  const images = analyzeImages(html);
  const links = analyzeLinks(html, url);

  // Collect all issues
  const allIssues: SEOIssue[] = [
    ...metaTags.issues,
    ...headings.issues,
    ...content.issues,
    ...images.issues,
    ...links.issues,
  ];

  // Calculate overall score (0-100)
  const score = calculateSEOScore({
    metaTags,
    headings,
    content,
    images,
    links,
  });

  return {
    metaTags,
    headings,
    content,
    images,
    links,
    issues: allIssues,
    score,
  };
}

/**
 * Analyze meta tags
 */
function analyzeMetaTags(html: string): MetaTagAnalysis {
  const issues: SEOIssue[] = [];
  
  // Extract meta tags using regex
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;
  const titleLength = title?.length || 0;

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const description = descMatch ? descMatch[1].trim() : undefined;
  const descriptionLength = description?.length || 0;

  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i);
  const keywords = keywordsMatch
    ? keywordsMatch[1].split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  // Open Graph tags
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : undefined;

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const ogDescription = ogDescMatch ? ogDescMatch[1].trim() : undefined;

  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  const ogImage = ogImageMatch ? ogImageMatch[1].trim() : undefined;

  const ogTypeMatch = html.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']*)["']/i);
  const ogType = ogTypeMatch ? ogTypeMatch[1].trim() : undefined;

  const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["']/i);
  const ogUrl = ogUrlMatch ? ogUrlMatch[1].trim() : undefined;

  // Twitter Card tags
  const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);
  const twitterCard = twitterCardMatch ? twitterCardMatch[1].trim() : undefined;

  const twitterTitleMatch = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["']/i);
  const twitterTitle = twitterTitleMatch ? twitterTitleMatch[1].trim() : undefined;

  const twitterDescMatch = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["']/i);
  const twitterDescription = twitterDescMatch ? twitterDescMatch[1].trim() : undefined;

  const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["']/i);
  const twitterImage = twitterImageMatch ? twitterImageMatch[1].trim() : undefined;

  // Canonical URL
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : undefined;

  // Language
  const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["']/i);
  const language = langMatch ? langMatch[1].trim() : undefined;

  // Validation checks
  if (!title) {
    issues.push({
      code: "META_TITLE_MISSING",
      category: "meta",
      severity: "error",
      message: "Meta title is missing",
      fix: "Add a <title> tag to the page",
      element: "title",
    });
  } else if (titleLength < 30) {
    issues.push({
      code: "META_TITLE_SHORT",
      category: "meta",
      severity: "warning",
      message: `Meta title is too short (${titleLength} chars). Recommended: 30-60 chars`,
      fix: "Increase title length to 30-60 characters",
      element: "title",
    });
  } else if (titleLength > 70) {
    issues.push({
      code: "META_TITLE_LONG",
      category: "meta",
      severity: "warning",
      message: `Meta title is too long (${titleLength} chars). Recommended: max 60 chars`,
      fix: "Reduce title length to 60 characters or less",
      element: "title",
    });
  }

  if (!description) {
    issues.push({
      code: "META_DESC_MISSING",
      category: "meta",
      severity: "warning",
      message: "Meta description is missing",
      fix: "Add a meta description tag",
      element: "meta[name='description']",
    });
  } else if (descriptionLength < 120) {
    issues.push({
      code: "META_DESC_SHORT",
      category: "meta",
      severity: "warning",
      message: `Meta description is too short (${descriptionLength} chars). Recommended: 120-160 chars`,
      fix: "Increase description length to 120-160 characters",
      element: "meta[name='description']",
    });
  } else if (descriptionLength > 170) {
    issues.push({
      code: "META_DESC_LONG",
      category: "meta",
      severity: "info",
      message: `Meta description is too long (${descriptionLength} chars). Recommended: max 160 chars`,
      fix: "Reduce description length to 160 characters",
      element: "meta[name='description']",
    });
  }

  if (!ogTitle) {
    issues.push({
      code: "OG_TITLE_MISSING",
      category: "meta",
      severity: "warning",
      message: "Open Graph title is missing",
      fix: "Add og:title meta tag",
      element: "meta[property='og:title']",
    });
  }

  if (!ogDescription) {
    issues.push({
      code: "OG_DESC_MISSING",
      category: "meta",
      severity: "warning",
      message: "Open Graph description is missing",
      fix: "Add og:description meta tag",
      element: "meta[property='og:description']",
    });
  }

  if (!ogImage) {
    issues.push({
      code: "OG_IMAGE_MISSING",
      category: "meta",
      severity: "warning",
      message: "Open Graph image is missing",
      fix: "Add og:image meta tag (recommended: 1200x630px)",
      element: "meta[property='og:image']",
    });
  }

  if (!canonical) {
    issues.push({
      code: "CANONICAL_MISSING",
      category: "meta",
      severity: "info",
      message: "Canonical URL is missing",
      fix: "Add canonical link tag to prevent duplicate content",
      element: "link[rel='canonical']",
    });
  }

  if (!language) {
    issues.push({
      code: "LANG_MISSING",
      category: "meta",
      severity: "info",
      message: "Language declaration is missing",
      fix: "Add lang attribute to <html> tag",
      element: "html",
    });
  }

  return {
    title,
    titleLength,
    description,
    descriptionLength,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    ogUrl,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    canonical,
    language,
    issues,
  };
}

/**
 * Analyze heading hierarchy
 */
function analyzeHeadings(html: string): HeadingAnalysis {
  const issues: SEOIssue[] = [];
  
  // Extract headings
  const h1Matches = html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi);
  const h1: string[] = Array.from(h1Matches).map((m) => m[1].trim());

  const h2Matches = html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi);
  const h2: string[] = Array.from(h2Matches).map((m) => m[1].trim());

  const h3Matches = html.matchAll(/<h3[^>]*>(.*?)<\/h3>/gi);
  const h3: string[] = Array.from(h3Matches).map((m) => m[1].trim());

  const h4Matches = html.matchAll(/<h4[^>]*>(.*?)<\/h4>/gi);
  const h4: string[] = Array.from(h4Matches).map((m) => m[1].trim());

  const h5Matches = html.matchAll(/<h5[^>]*>(.*?)<\/h5>/gi);
  const h5: string[] = Array.from(h5Matches).map((m) => m[1].trim());

  const h6Matches = html.matchAll(/<h6[^>]*>(.*?)<\/h6>/gi);
  const h6: string[] = Array.from(h6Matches).map((m) => m[1].trim());

  // Validation checks
  if (h1.length === 0) {
    issues.push({
      code: "H1_MISSING",
      category: "heading",
      severity: "error",
      message: "H1 heading is missing",
      fix: "Add a single H1 heading to the page",
      element: "h1",
    });
  } else if (h1.length > 1) {
    issues.push({
      code: "H1_MULTIPLE",
      category: "heading",
      severity: "warning",
      message: `Multiple H1 headings found (${h1.length}). Recommended: 1 H1 per page`,
      fix: "Use only one H1 heading per page",
      element: "h1",
    });
  }

  // Check hierarchy (h3 before h2, etc.)
  let hierarchyValid = true;
  if (h3.length > 0 && h2.length === 0) {
    hierarchyValid = false;
    issues.push({
      code: "HEADING_HIERARCHY_INVALID",
      category: "heading",
      severity: "warning",
      message: "H3 found without H2. Heading hierarchy should be sequential",
      fix: "Ensure heading hierarchy is sequential (h1 → h2 → h3 → ...)",
      element: "h3",
    });
  }

  return {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    hierarchyValid,
    issues,
  };
}

/**
 * Analyze content quality
 */
function analyzeContent(html: string): ContentAnalysis {
  const issues: SEOIssue[] = [];
  
  // Extract text content (basic extraction, remove scripts and styles)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;

  // Remove script and style tags
  const textContent = bodyContent
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Count words
  const words = textContent.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Count paragraphs
  const paragraphMatches = bodyContent.matchAll(/<p[^>]*>/gi);
  const paragraphCount = Array.from(paragraphMatches).length;

  // Count links
  const linkMatches = bodyContent.matchAll(/<a[^>]*href=["']([^"']*)["']/gi);
  const linkCount = Array.from(linkMatches).length;

  // Count images
  const imageMatches = bodyContent.matchAll(/<img[^>]*>/gi);
  const imageCount = Array.from(imageMatches).length;

  // Validation checks
  if (wordCount < 300) {
    issues.push({
      code: "CONTENT_TOO_SHORT",
      category: "content",
      severity: "warning",
      message: `Content is too short (${wordCount} words). Recommended: 300+ words`,
      fix: "Add more content to the page (target: 800+ words for articles)",
      element: "body",
    });
  }

  if (paragraphCount === 0) {
    issues.push({
      code: "NO_PARAGRAPHS",
      category: "content",
      severity: "warning",
      message: "No paragraphs found",
      fix: "Add paragraph content to the page",
      element: "body",
    });
  }

  return {
    wordCount,
    paragraphCount,
    linkCount,
    imageCount,
    issues,
  };
}

/**
 * Analyze images
 */
function analyzeImages(html: string): ImageAnalysis {
  const issues: SEOIssue[] = [];
  const images: ImageAnalysis["images"] = [];

  // Extract images
  const imageMatches = html.matchAll(/<img[^>]*>/gi);
  
  for (const match of imageMatches) {
    const imgTag = match[0];
    const srcMatch = imgTag.match(/src=["']([^"']*)["']/i);
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i);
    const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i);

    const imageIssues: string[] = [];
    const src = srcMatch ? srcMatch[1].trim() : undefined;
    const alt = altMatch ? altMatch[1].trim() : undefined;
    const width = widthMatch ? parseInt(widthMatch[1], 10) : undefined;
    const height = heightMatch ? parseInt(heightMatch[1], 10) : undefined;

    if (!alt) {
      imageIssues.push("Missing alt text");
    } else if (alt.length === 0) {
      imageIssues.push("Alt text is empty");
    }

    images.push({
      src,
      alt,
      width,
      height,
      issues: imageIssues,
    });
  }

  const totalImages = images.length;
  const imagesWithAlt = images.filter((img) => img.alt && img.alt.length > 0).length;
  const imagesWithoutAlt = totalImages - imagesWithAlt;

  // Validation checks
  if (imagesWithoutAlt > 0) {
    issues.push({
      code: "IMAGES_WITHOUT_ALT",
      category: "image",
      severity: "warning",
      message: `${imagesWithoutAlt} image(s) without alt text`,
      fix: "Add descriptive alt text to all images",
      element: "img",
    });
  }

  return {
    images,
    totalImages,
    imagesWithAlt,
    imagesWithoutAlt,
    issues,
  };
}

/**
 * Analyze links
 */
function analyzeLinks(html: string, baseUrl: string): LinkAnalysis {
  const issues: SEOIssue[] = [];
  
  // Extract links
  const linkMatches = html.matchAll(/<a[^>]*href=["']([^"']*)["']/gi);
  const links: string[] = Array.from(linkMatches).map((m) => m[1].trim());

  // Categorize links
  const internal: string[] = [];
  const external: string[] = [];
  const broken: string[] = [];

  const baseDomain = new URL(baseUrl).hostname;

  for (const link of links) {
    if (link.startsWith("#") || link.startsWith("javascript:") || link.startsWith("mailto:")) {
      continue; // Skip anchors and special links
    }

    try {
      const url = link.startsWith("http") ? new URL(link) : new URL(link, baseUrl);
      if (url.hostname === baseDomain || !url.hostname) {
        internal.push(link);
      } else {
        external.push(link);
      }
    } catch {
      // Invalid URL - could be broken
      broken.push(link);
    }
  }

  // Validation checks
  if (broken.length > 0) {
    issues.push({
      code: "BROKEN_LINKS",
      category: "link",
      severity: "warning",
      message: `${broken.length} potentially broken link(s) found`,
      fix: "Fix or remove broken links",
      element: "a",
    });
  }

  return {
    internal: internal.length,
    external: external.length,
    total: links.length,
    broken,
    issues,
  };
}

/**
 * Calculate overall SEO score (0-100)
 */
function calculateSEOScore(analysis: {
  metaTags: MetaTagAnalysis;
  headings: HeadingAnalysis;
  content: ContentAnalysis;
  images: ImageAnalysis;
  links: LinkAnalysis;
}): number {
  let score = 100;

  // Deduct points for issues
  for (const issue of analysis.metaTags.issues) {
    if (issue.severity === "error") score -= 10;
    else if (issue.severity === "warning") score -= 5;
    else if (issue.severity === "info") score -= 2;
  }

  for (const issue of analysis.headings.issues) {
    if (issue.severity === "error") score -= 10;
    else if (issue.severity === "warning") score -= 5;
  }

  for (const issue of analysis.content.issues) {
    if (issue.severity === "warning") score -= 5;
  }

  for (const issue of analysis.images.issues) {
    if (issue.severity === "warning") score -= 3;
  }

  for (const issue of analysis.links.issues) {
    if (issue.severity === "warning") score -= 2;
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}
