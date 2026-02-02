'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import NextImage from 'next/image';
import { Maximize2, Trash2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThumbnailImageViewProps {
  // Image data
  imageUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  filename?: string;
  width?: number;
  height?: number;

  // Cloudinary support (for thumbnail generation)
  cloudinaryPublicId?: string | null;
  cloudinaryVersion?: string | null;

  // Actions
  onRemove?: () => void;
  onChange?: () => void;
  showRemove?: boolean;
  showChange?: boolean;
  buttonSize?: 'sm' | 'default' | 'lg';

  // Customization
  aspectRatio?: 'video' | 'square' | 'auto';
  className?: string;
  thumbnailSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;

  // Labels (for i18n support)
  removeConfirmTitle?: string;
  removeConfirmDescription?: string;
}

export function ThumbnailImageView({
  imageUrl,
  thumbnailUrl,
  altText,
  filename,
  width,
  height,
  cloudinaryPublicId,
  cloudinaryVersion,
  onRemove,
  onChange,
  showRemove,
  showChange,
  buttonSize = 'default',
  aspectRatio = 'video',
  className,
  thumbnailSize = 'sm',
  fullWidth = false,
  removeConfirmTitle = 'Remove Image',
  removeConfirmDescription = 'Are you sure you want to remove this image? This action cannot be undone.',
}: ThumbnailImageViewProps) {
  const [fullImageOpen, setFullImageOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  // Thumbnail size mapping (height in pixels)
  const thumbnailSizeMap = {
    sm: 150,
    md: 240,
    lg: 400,
  };

  // Max width mapping for display
  const maxWidthMap = {
    square: { sm: 'max-w-[150px]', md: 'max-w-[240px]', lg: 'max-w-[400px]' },
    video: { sm: 'max-w-[267px]', md: 'max-w-[427px]', lg: 'max-w-[712px]' },
  };

  const maxWidthClass = fullWidth
    ? ''
    : maxWidthMap[aspectRatio === 'square' ? 'square' : 'video']?.[thumbnailSize] || '';

  const getThumbnailUrl = (): string => {
    if (thumbnailUrl) return thumbnailUrl;

    if (cloudinaryPublicId) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfegnpgwx';
      const format = filename?.split('.').pop() || 'png';

      // Clean public ID (remove extension if present)
      let publicId = cloudinaryPublicId;
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const lastDot = publicId.lastIndexOf('.');
      if (lastDot > 0 && validExtensions.includes(publicId.substring(lastDot + 1).toLowerCase())) {
        publicId = publicId.substring(0, lastDot);
      }

      // Generate thumbnail dimensions
      const sizePixels = thumbnailSizeMap[thumbnailSize];
      const thumbWidth = aspectRatio === 'square' ? sizePixels : Math.round(sizePixels * 1.78);
      const thumbHeight = sizePixels;

      return `https://res.cloudinary.com/${cloudName}/image/upload/w_${thumbWidth},h_${thumbHeight},c_fill,q_auto,f_auto/${publicId}.${format}`;
    }

    return imageUrl;
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      setRemoveConfirmOpen(false);
    }
  };

  const shouldShowRemove = showRemove !== undefined ? showRemove : !!onRemove;
  const shouldShowChange = showChange !== undefined ? showChange : !!onChange;
  const hasActions = shouldShowRemove || shouldShowChange;
  const aspectRatioClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
        ? 'aspect-video'
        : '';

  return (
    <>
      <Card className={cn('overflow-hidden hover:shadow-lg transition-all duration-300 border hover:border-primary/30', maxWidthClass, className)}>
        <CardContent className="p-0">
          {/* Thumbnail Image */}
          <div
            className={cn(
              'relative overflow-hidden bg-muted cursor-pointer group',
              aspectRatioClass,
              aspectRatio === 'auto' && 'min-h-[200px]'
            )}
            onClick={() => setFullImageOpen(true)}
          >
            {getThumbnailUrl() ? (
              <>
                <NextImage
                  src={getThumbnailUrl()}
                  alt={altText || filename || 'Image thumbnail'}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Hover overlay with backdrop blur */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex flex-col items-center gap-2 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Maximize2 className="h-8 w-8" />
                    <span className="text-xs font-medium">View Full Image</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Image Info */}
          <div className="p-4 space-y-3 bg-card">
            <div className="space-y-2">
              {filename && (
                <p className="text-sm font-semibold line-clamp-1 text-foreground">{filename}</p>
              )}
              {altText && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {altText}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {width && height && (
                  <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
                    {width} × {height}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            {hasActions && (
              <div className="flex gap-2">
                {shouldShowChange && (
                  <Button
                    type="button"
                    variant="outline"
                    size={buttonSize}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange?.();
                    }}
                    className="flex-1"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                )}
                {shouldShowRemove && (
                  <Button
                    type="button"
                    variant="destructive"
                    size={buttonSize}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRemoveConfirmOpen(true);
                    }}
                    className={cn('hover:bg-destructive/90 transition-colors', shouldShowChange ? 'flex-1' : 'w-full')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Image Modal */}
      <Dialog open={fullImageOpen} onOpenChange={setFullImageOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-bold">{filename || 'Image Preview'}</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-6 overflow-auto">
            <div className="relative w-full max-h-[75vh] min-h-[400px] overflow-hidden rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-inner">
              {imageUrl ? (
                <NextImage
                  src={imageUrl}
                  alt={altText || filename || 'Full image'}
                  width={width || 1200}
                  height={height || 800}
                  className="object-contain max-w-full max-h-[75vh] rounded-lg shadow-2xl"
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            {(altText || filename || (width && height)) && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border space-y-3">
                {filename && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Filename</p>
                    <p className="text-sm font-medium">{filename}</p>
                  </div>
                )}
                {altText && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{altText}</p>
                  </div>
                )}
                {width && height && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Dimensions:</p>
                    <Badge variant="secondary" className="text-xs font-medium px-3 py-1">
                      {width} × {height} pixels
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      {shouldShowRemove && (
        <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{removeConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {removeConfirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRemoveConfirmOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
