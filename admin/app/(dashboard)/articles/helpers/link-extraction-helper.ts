"use client";

export interface ExtractedLink {
  url: string;
  text: string;
  rel?: string;
  target?: string;
  isExternal: boolean;
  domain: string;
  isAuthoritative: boolean;
  category: 'citation' | 'client' | 'internal' | 'other';
}

/**
 * Authoritative domains for E-E-A-T citations
 */
const AUTHORITATIVE_PATTERNS = [
  // Government
  /\.gov$/i,
  /\.gov\./i,
  
  // Education
  /\.edu$/i,
  /\.edu\./i,
  /\.ac\./i,
  
  // Research
  'scholar.google.com',
  'pubmed.ncbi.nlm.nih.gov',
  'arxiv.org',
  'researchgate.net',
  
  // Wikipedia
  'wikipedia.org',
  
  // Major News (Arabic + International)
  'bbc.com',
  'reuters.com',
  'apnews.com',
  'aljazeera.net',
  'alarabiya.net',
  
  // Standards
  'w3.org',
  'ietf.org',
  'who.int',
  'un.org',
];

/**
 * Check if domain is authoritative - SAFE & COMPLETE
 */
export function isAuthoritativeDomain(domain: string): boolean {
  const lowerDomain = domain.toLowerCase();
  
  return AUTHORITATIVE_PATTERNS.some(pattern => {
    if (typeof pattern === 'string') {
      return lowerDomain.includes(pattern);
    }
    return pattern.test(lowerDomain);
  });
}

/**
 * Extract all links from HTML - SAFE with full error handling
 */
export function extractLinksFromContent(htmlContent: string): ExtractedLink[] {
  if (!htmlContent || typeof window === 'undefined') {
    return [];
  }
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('HTML parsing error');
      return [];
    }
    
    const anchors = doc.querySelectorAll('a[href]');
    const links: ExtractedLink[] = [];
    const currentDomain = window.location.hostname;
    
    anchors.forEach(anchor => {
      try {
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
          return;
        }
        
        const url = new URL(href, window.location.origin);
        const domain = url.hostname;
        const isExternal = domain !== currentDomain;
        const isAuthoritative = isExternal && isAuthoritativeDomain(domain);
        
        let category: ExtractedLink['category'];
        if (!isExternal) {
          category = 'internal';
        } else if (isAuthoritative) {
          category = 'citation';
        } else {
          category = 'other';
        }
        
        links.push({
          url: url.href,
          text: anchor.textContent?.trim() || '',
          rel: anchor.getAttribute('rel') || undefined,
          target: anchor.getAttribute('target') || undefined,
          isExternal,
          domain,
          isAuthoritative,
          category,
        });
      } catch (error) {
        // Skip invalid URLs silently
      }
    });
    
    return links;
  } catch (error) {
    console.error('Error extracting links:', error);
    return [];
  }
}
