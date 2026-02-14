import Image from 'next/image';
import type { CSSProperties, SyntheticEvent } from 'react';

/** Allowed quality values - must match next.config images.qualities */
const QUALITIES = [25, 50, 75, 100] as const;
type QualityValue = (typeof QUALITIES)[number];

function clampQuality(value: number): QualityValue {
  const closest = QUALITIES.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
  return closest;
}

interface BaseOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** @deprecated Use preload. Kept for backward compat: sets preload + fetchPriority high */
  priority?: boolean;
  preload?: boolean;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Must be one of next.config qualities (25, 50, 75, 100). 'auto' → 75 or 100 when preload */
  quality?: QualityValue | 'auto';
  sizes?: string;
  itemProp?: string;
  placeholder?: 'blur' | 'empty' | `data:image/${string}`;
  blurDataURL?: string;
  unoptimized?: boolean;
  loader?: (p: { src: string; width: number; quality?: number }) => string;
  overrideSrc?: string;
  decoding?: 'async' | 'sync' | 'auto';
  onLoad?: (e: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: SyntheticEvent<HTMLImageElement>) => void;
}

type OptimizedImageProps = BaseOptimizedImageProps &
  (
    | { width: number; height: number; fill?: never }
    | { fill: true; width?: never; height?: never }
  );

export function optimizeCloudinaryUrl(url: string, forLcp?: boolean): string {
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.toLowerCase().endsWith('.svg')) return url;
  if (url.includes('/f_auto') || url.includes('/q_auto')) return url;

  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;
    const beforeUpload = url.substring(0, uploadIndex + 8);
    const afterUpload = url.substring(uploadIndex + 8);
    const baseTransforms = 'f_auto,q_auto,c_fill,g_auto';
    const transforms = forLcp
      ? `${baseTransforms},w_1200,d_article-placeholder-default`
      : `${baseTransforms},d_article-placeholder-default`;
    return `${beforeUpload}${transforms}/${afterUpload}`;
  } catch {
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
  style,
  priority = false,
  preload,
  loading,
  fetchPriority,
  quality = 'auto',
  sizes,
  itemProp,
  placeholder,
  blurDataURL,
  unoptimized,
  loader,
  overrideSrc,
  decoding,
  onLoad,
  onError,
}: OptimizedImageProps) {
  if (!src?.trim()) return null;

  const shouldPreload = preload ?? priority;
  const isHighPriority = shouldPreload;
  const resolvedQuality: number =
    quality === 'auto'
      ? shouldPreload ? 100 : 75
      : typeof quality === 'number'
        ? clampQuality(quality)
        : 75;

  if (
    process.env.NODE_ENV === 'development' &&
    !fill &&
    (width == null || height == null)
  ) {
    throw new Error(
      'OptimizedImage: width and height are required when fill is not true'
    );
  }

  return (
    <Image
      src={optimizeCloudinaryUrl(src, isHighPriority)}
      alt={alt}
      fill={fill ?? false}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      style={style}
      preload={shouldPreload}
      loading={shouldPreload ? undefined : (loading ?? 'lazy')}
      fetchPriority={isHighPriority ? 'high' : fetchPriority ?? 'auto'}
      quality={resolvedQuality}
      sizes={sizes}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      unoptimized={unoptimized}
      loader={loader}
      overrideSrc={overrideSrc}
      decoding={decoding}
      onLoad={onLoad}
      onError={onError}
      {...(itemProp && { itemProp })}
    />
  );
}
