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

function optimizeCloudinaryUrl(url: string, forLcp?: boolean): string {
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
    const transforms = forLcp
      ? 'f_auto,q_auto,w_1200,c_limit,d_article-placeholder-default'
      : 'f_auto,q_auto,d_article-placeholder-default';

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
  loading,
  sizes,
  quality = 'auto',
  itemProp,
  fetchPriority,
}: OptimizedImageProps) {
  if (!src || src.trim() === '') {
    return null;
  }

  const optimizedSrc = optimizeCloudinaryUrl(src, priority);

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      preload={priority}
      loading={priority ? undefined : (loading || "lazy")}
      sizes={sizes}
      quality={quality === 'auto' ? (priority ? 65 : 75) : quality}
      {...(itemProp && { itemProp })}
      fetchPriority={priority ? "high" : fetchPriority}
    />
  );
}

