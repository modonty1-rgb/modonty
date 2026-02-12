import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  preload?: boolean;
  fetchPriorityHigh?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  quality?: number | 'auto';
  itemProp?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function optimizeCloudinaryUrl(url: string, forLcp?: boolean): string {
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  if (url.toLowerCase().endsWith('.svg')) {
    return url;
  }

  if (url.includes('/f_auto') || url.includes('/q_auto')) {
    return url;
  }

  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    const beforeUpload = url.substring(0, uploadIndex + 8);
    const afterUpload = url.substring(uploadIndex + 8);
    const baseTransforms = 'f_auto,q_auto,c_fill,g_auto';
    const transforms = forLcp
      ? `${baseTransforms},w_1200,c_limit,d_article-placeholder-default`
      : `${baseTransforms},d_article-placeholder-default`;

    return `${beforeUpload}${transforms}/${afterUpload}`;
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
  preload,
  fetchPriorityHigh = false,
  loading,
  sizes,
  quality = 'auto',
  itemProp,
  fetchPriority,
}: OptimizedImageProps) {
  if (!src || src.trim() === '') {
    return null;
  }

  const shouldPreload = preload ?? priority;
  const isHighPriority = shouldPreload || fetchPriorityHigh;

  return (
    <Image
      src={optimizeCloudinaryUrl(src, priority || isHighPriority)}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      preload={shouldPreload}
      loading={priority ? undefined : (loading || "lazy")}
      sizes={sizes}
      quality={quality === 'auto' ? (priority ? 65 : 75) : quality}
      {...(itemProp && { itemProp })}
      fetchPriority={isHighPriority ? "high" : (fetchPriority ?? "auto")}
    />
  );
}

