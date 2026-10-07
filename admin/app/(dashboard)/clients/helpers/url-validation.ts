export type Platform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'other';

/**
 * Normalizes URL by adding https:// protocol if missing
 */
function normalizeUrl(url: string): string {
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
