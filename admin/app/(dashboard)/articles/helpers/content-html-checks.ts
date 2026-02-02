'use client';

/**
 * Lightweight HTML content checks for the Quick SEO Content Check.
 * Works directly on the TipTap HTML string without needing DOM parsing.
 */

// Headline (H1) present
export function hasH1(html: string): boolean {
  if (!html) return false;
  return /<h1(\s|>)/i.test(html);
}

// Subheadings (H2 or H3) present
export function hasH2orH3(html: string): boolean {
  if (!html) return false;
  return /<h2(\s|>)/i.test(html) || /<h3(\s|>)/i.test(html);
}

// At least one <img> with an alt attribute
export function hasImageWithAlt(html: string): boolean {
  if (!html) return false;
  return /<img[^>]*\salt\s*=\s*["'][^"']*["']/i.test(html);
}

// At least one <a> with href
export function hasLink(html: string): boolean {
  if (!html) return false;
  return /<a\s+[^>]*href\s*=\s*["'][^"']+["']/i.test(html);
}

// Paragraphs are concise: no <p> block has more than maxLength visible characters
export function areParagraphsConcise(html: string, maxLength: number = 500): boolean {
  if (!html) return true;

  // If there are no <p> tags, treat as concise (same behavior as before)
  if (!/<p[\s>]/i.test(html)) return true;

  // Split on closing </p> tags (case-insensitive)
  const segments = html.split(/<\/p\s*>/i);

  for (const segment of segments) {
    if (!segment) continue;
    // Keep only the part after the opening <p ...>
    const afterP = segment.replace(/^[\s\S]*?<p[\s>]/i, '');
    // Strip any remaining HTML tags
    const textOnly = afterP.replace(/<[^>]*>/g, '').trim();
    if (textOnly.length > maxLength) {
      return false;
    }
  }

  return true;
}

