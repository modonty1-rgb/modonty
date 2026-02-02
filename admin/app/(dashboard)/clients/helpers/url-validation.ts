export type Platform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'other';

export interface URLValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  platform: Platform;
  error?: string;
}

/**
 * Normalizes URL by adding https:// protocol if missing
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  
  // If already has protocol, return as is
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Add https:// if missing
  return `https://${trimmed}`;
}

/**
 * Detects the social media platform from URL
 */
export function detectPlatform(url: string): Platform {
  const normalized = normalizeUrl(url);
  const hostname = new URL(normalized).hostname.toLowerCase();
  
  if (hostname.includes('linkedin.com')) return 'linkedin';
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
  if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'facebook';
  if (hostname.includes('instagram.com')) return 'instagram';
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
  if (hostname.includes('tiktok.com')) return 'tiktok';
  
  return 'other';
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    
    // Check if URL has valid protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check if URL has valid hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return false;
    }
    
    // Check URL length (max 2048 chars)
    if (normalized.length > 2048) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates and normalizes a social profile URL
 */
export function validateSocialUrl(url: string, existingUrls: string[] = []): URLValidationResult {
  const trimmed = url.trim();
  
  // Check if empty
  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: '',
      platform: 'other',
      error: 'URL cannot be empty',
    };
  }
  
  // Normalize URL
  let normalized: string;
  try {
    normalized = normalizeUrl(trimmed);
  } catch {
    return {
      isValid: false,
      normalizedUrl: trimmed,
      platform: 'other',
      error: 'Invalid URL format',
    };
  }
  
  // Validate URL format
  if (!isValidUrl(normalized)) {
    return {
      isValid: false,
      normalizedUrl: normalized,
      platform: 'other',
      error: 'Invalid URL format. Please enter a valid URL (e.g., linkedin.com/company/example)',
    };
  }
  
  // Check for duplicates
  const normalizedExisting = existingUrls.map(u => normalizeUrl(u));
  if (normalizedExisting.includes(normalized)) {
    return {
      isValid: false,
      normalizedUrl: normalized,
      platform: detectPlatform(normalized),
      error: 'This URL has already been added',
    };
  }
  
  // Detect platform
  const platform = detectPlatform(normalized);
  
  return {
    isValid: true,
    normalizedUrl: normalized,
    platform,
  };
}

/**
 * Gets platform icon name for Lucide icons
 */
export function getPlatformIcon(platform: Platform): string {
  switch (platform) {
    case 'linkedin':
      return 'Linkedin';
    case 'twitter':
      return 'Twitter';
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'youtube':
      return 'Youtube';
    case 'tiktok':
      return 'Music';
    default:
      return 'Link';
  }
}

/**
 * Gets platform display name
 */
export function getPlatformName(platform: Platform): string {
  switch (platform) {
    case 'linkedin':
      return 'LinkedIn';
    case 'twitter':
      return 'Twitter/X';
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'youtube':
      return 'YouTube';
    case 'tiktok':
      return 'TikTok';
    default:
      return 'Other';
  }
}
