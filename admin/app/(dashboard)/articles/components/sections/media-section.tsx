'use client';

import { useState, useEffect } from 'react';
import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ImageGalleryManager } from '../image-gallery-manager';
import { Button } from '@/components/ui/button';
import { MediaPickerDialog } from '@/components/shared/media-picker-dialog';
import { getMediaById } from '@/app/(dashboard)/media/actions/get-media-by-id';
import { ThumbnailImageView } from '@/components/shared/thumbnail-image-view';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface FeaturedMedia {
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  cloudinaryPublicId?: string | null;
  cloudinaryVersion?: string | null;
}

export function MediaSection() {
  const { formData, updateField } = useArticleForm();
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [featuredMedia, setFeaturedMedia] = useState<FeaturedMedia | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);


  useEffect(() => {
    const fetchMedia = async () => {
      if (!formData.featuredImageId || !formData.clientId) {
        setFeaturedMedia(null);
        return;
      }

      setLoadingMedia(true);
      try {
        const media = await getMediaById(formData.featuredImageId, formData.clientId);
        if (media) {
          setFeaturedMedia({
            id: media.id,
            url: media.url,
            filename: media.filename,
            altText: media.altText,
            width: media.width,
            height: media.height,
            cloudinaryPublicId: media.cloudinaryPublicId,
            cloudinaryVersion: media.cloudinaryVersion,
          });
        } else {
          setFeaturedMedia(null);
        }
      } catch (error) {
        console.error('Error fetching featured media:', error);
        setFeaturedMedia(null);
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchMedia();
  }, [formData.featuredImageId, formData.clientId]);

  const handleSelectMedia = (media: {
    url: string;
    altText: string | null;
    mediaId: string;
    width?: number | null;
    height?: number | null;
  }) => {
    updateField('featuredImageId', media.mediaId);
    updateField('featuredImageAlt', media.altText ?? null);
    setMediaPickerOpen(false);
  };

  const handleRemoveMedia = () => {
    updateField('featuredImageId', null);
    updateField('featuredImageAlt', null);
    setFeaturedMedia(null);
  };

  const handleChangeMedia = () => {
    setMediaPickerOpen(true);
  };

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Featured Image */}
        <div className="space-y-4">
          <Label>Featured Image</Label>

          {!formData.clientId ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Client must be selected first to select featured image
              </p>
            </div>
          ) : loadingMedia ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : featuredMedia ? (
            <ThumbnailImageView
              imageUrl={featuredMedia.url}
              cloudinaryPublicId={featuredMedia.cloudinaryPublicId}
              cloudinaryVersion={featuredMedia.cloudinaryVersion}
              altText={featuredMedia.altText || undefined}
              filename={featuredMedia.filename}
              width={featuredMedia.width || undefined}
              height={featuredMedia.height || undefined}
              onRemove={handleRemoveMedia}
              onChange={handleChangeMedia}
              aspectRatio="video"
              thumbnailSize="lg"
              fullWidth={true}
              buttonSize="default"
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setMediaPickerOpen(true)}
              disabled={!formData.clientId}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Select Featured Image
            </Button>
          )}

          <MediaPickerDialog
            open={mediaPickerOpen}
            onOpenChange={setMediaPickerOpen}
            clientId={formData.clientId}
            onSelect={handleSelectMedia}
          />
        </div>

        {/* Gallery */}
        <div className="border-t pt-6">
          {!formData.clientId ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Client must be selected first to use image gallery
              </p>
            </div>
          ) : (
            <ImageGalleryManager
              clientId={formData.clientId}
              gallery={formData.gallery || []}
              onGalleryChange={(gallery) => updateField('gallery', gallery)}
              disabled={!formData.clientId}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
