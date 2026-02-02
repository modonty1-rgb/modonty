'use client';

import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  quality?: number | 'auto';
  itemProp?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

function optimizeCloudinaryUrl(url: string): string {
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  // Skip SVGs
  if (url.toLowerCase().endsWith('.svg')) {
    return url;
  }

  // Check if URL already has transformations
  if (url.includes('/f_auto') || url.includes('/q_auto')) {
    return url;
  }

  try {
    // Add Cloudinary optimizations
    // f_auto: Auto format (WebP/AVIF)
    // q_auto: Auto quality
    // d_: Default fallback image for missing/broken images
    // Removed w_auto to prevent client-side delay (LCP optimization)
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    const beforeUpload = url.substring(0, uploadIndex + 8);
    const afterUpload = url.substring(uploadIndex + 8);
    
    // Add default_image fallback for missing/broken images
    return `${beforeUpload}f_auto,q_auto,d_article-placeholder-default/${afterUpload}`;
  } catch (error) {
    return url;
  }
}

export function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority = false,
  loading,
  sizes,
  quality = 'auto',
  itemProp,
  fetchPriority,
}: OptimizedImageProps) {
  if (!src || src.trim() === '') {
    return null;
  }

  // Optimize Cloudinary URLs with transformations
  const optimizedSrc = optimizeCloudinaryUrl(src);
  
  // Auto-set fetchPriority="high" for priority images (LCP optimization)
  const effectiveFetchPriority = priority ? 'high' : (fetchPriority || undefined);
  
  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      loading={priority ? undefined : (loading || 'lazy')}
      sizes={sizes}
      quality={quality === 'auto' ? 75 : quality}
      {...(itemProp && { itemProp })}
      {...(effectiveFetchPriority && { fetchPriority: effectiveFetchPriority })}
    />
  );
}

