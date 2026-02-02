/**
 * Word counting utilities for content analysis
 * Handles both standard and Arabic text word counting
 */

/**
 * Standard word counting function
 * Splits text by whitespace and counts words
 */
export function calculateWordCount(content: string): number {
  if (!content) return 0;
  const stripped = content.replace(/<[^>]*>/g, "");
  const words = stripped.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Improved word counting function with Arabic language support
 * Uses Unicode word boundaries (UAX-29) for accurate word counting
 * Detects Arabic text and uses more accurate counting method
 * 
 * @param content - HTML string or plain text. If HTML, it will be stripped.
 * @param language - Optional language code (e.g., "ar", "arabic")
 */
export function calculateWordCountImproved(content: string, language?: string): number {
  if (!content) return 0;

  // Check if content contains HTML tags
  const hasHtmlTags = /<[^>]+>/.test(content);
  
  let stripped = content;
  
  if (hasHtmlTags) {
    // Remove script and style tags completely (including their content)
    stripped = stripped.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    stripped = stripped.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    
    // Strip all HTML tags
    stripped = stripped.replace(/<[^>]*>/g, "");
    
    // Decode HTML entities (common ones)
    stripped = stripped
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .trim();
  }
  
  // Ensure we have content after stripping
  if (!stripped || stripped.length === 0) return 0;

  // Detect if content contains Arabic characters
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(stripped);
  const isArabic = language === "ar" || language === "arabic" || hasArabic;

  if (isArabic) {
    // Remove Arabic diacritics (Tashkeel) - they don't count as separate words
    // Unicode ranges for Arabic diacritics: \u064B-\u065F, \u0670, \u0640, \u06D6-\u06ED
    const withoutDiacritics = stripped.replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, "");

    // Normalize: Replace all punctuation and non-word characters with spaces
    // This ensures punctuation doesn't create artificial word boundaries
    // Keep: Arabic letters, Arabic digits, and spaces
    const normalized = withoutDiacritics.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\u0660-\u0669\u06F0-\u06F9]/g, " ");
    
    // Collapse multiple consecutive spaces into single space
    const cleaned = normalized.replace(/\s+/g, " ").trim();
    
    // Split by spaces only (words in Arabic are separated by spaces)
    const tokens = cleaned.split(/\s+/);
    
    let words = tokens.filter((token) => {
      // Must have content
      if (!token || token.length === 0) return false;
      
      // Must contain at least one Arabic letter
      // Arabic Unicode ranges: \u0600-\u06FF (main), \u0750-\u077F (supplement), 
      // \u08A0-\u08FF (extended-A), \uFB50-\uFDFF (presentation forms-A), 
      // \uFE70-\uFEFF (presentation forms-B)
      const hasArabicLetter = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(token);
      
      if (!hasArabicLetter) return false;
      
      // Exclude sequences that are only numbers
      // Arabic-Indic digits: \u0660-\u0669
      // Extended Arabic-Indic digits: \u06F0-\u06F9
      // Western digits: 0-9
      const isOnlyNumbers = /^[\u0660-\u0669\u06F0-\u06F90-9]+$/.test(token);
      
      // Only count tokens with Arabic letters that are not just numbers
      return !isOnlyNumbers;
    });

    // Fallback: if there is visible text but no tokens matched our strict rules,
    // count all non-empty tokens as words to avoid returning 0 incorrectly.
    if (words.length === 0 && cleaned.trim().length > 0) {
      words = tokens.filter((token) => token && token.trim().length > 0);
    }

    return words.length;
  }

  // For non-Arabic: Use standard word boundary detection
  // Split by whitespace and Unicode word boundaries
  let words = stripped
    .split(/[\s\p{Z}\p{P}]+/u)
    .filter((word) => {
      // Must contain at least one letter character (Unicode category L)
      // This excludes numbers-only and punctuation-only sequences
      return word.length > 0 && /\p{L}/u.test(word);
    });

  // Fallback: if we still have non-empty text but no words were detected,
  // use a simpler whitespace-based split to avoid returning 0 for valid content.
  if (words.length === 0 && stripped.trim().length > 0) {
    words = stripped.trim().split(/\s+/).filter(Boolean);
  }

  return words.length;
}

/**
 * Detect if text contains Arabic characters
 */
export function detectArabicText(text: string): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Calculate reading time based on word count
 */
export function calculateReadingTime(wordCount: number, wordsPerMinute: number = 200): number {
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Determine content depth based on word count
 */
export function determineContentDepth(wordCount: number): "short" | "medium" | "long" {
  if (wordCount < 500) return "short";
  if (wordCount < 1500) return "medium";
  return "long";
}
