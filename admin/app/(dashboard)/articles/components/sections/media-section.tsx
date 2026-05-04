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
import { Image as ImageIcon, Loader2, ImagePlus, Music, Library, ArrowRight, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5 pb-1">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

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

function ClientRequiredEmptyState({ goToBasic }: { goToBasic: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-800">
      <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-3" />
      <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
        اختر العميل أولاً
      </p>
      <p className="text-xs text-amber-700 dark:text-amber-300/80 mb-4 max-w-sm">
        لإضافة الوسائط، نحتاج معرفة المالك أولاً. اختر العميل من تبويب Basic.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={goToBasic}
        className="gap-2 border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-950"
      >
        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        الذهاب إلى Basic
      </Button>
    </div>
  );
}

export function MediaSection() {
  const { formData, updateField, goToStep } = useArticleForm();
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [featuredMedia, setFeaturedMedia] = useState<FeaturedMedia | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const goToBasic = () => goToStep(1);

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
  };

  const handleChangeMedia = () => {
    setMediaPickerOpen(true);
  };

  return (
    <Card>
      <CardContent className="space-y-8 pt-6">
        {/* ─────────────────────────────────────────────
            Section 1 — صورة الغلاف
            ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <SectionHeader
            icon={ImagePlus}
            title="صورة الغلاف"
            description="الصورة الرئيسية التي تظهر في رأس المقال وفي بطاقات المشاركة"
          />

          {!formData.clientId ? (
            <ClientRequiredEmptyState goToBasic={goToBasic} />
          ) : loadingMedia ? (
            <div className="flex items-center justify-center py-12 border rounded-md">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
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
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              className="group flex flex-col items-center justify-center w-full text-center py-12 px-6 rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 group-hover:bg-primary/15 transition-colors">
                <ImagePlus className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Select Featured Image</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                موصى به: <span className="font-mono">1200×630px</span> (نسبة 16:9) — JPG/PNG/WebP
              </p>
            </button>
          )}
          <MediaPickerDialog
            open={mediaPickerOpen}
            onOpenChange={setMediaPickerOpen}
            clientId={formData.clientId}
            onSelect={handleSelectMedia}
          />
        </section>

        <div className="border-t" />

        {/* ─────────────────────────────────────────────
            Section 2 — النسخة الصوتية
            ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <SectionHeader
            icon={Music}
            title="النسخة الصوتية"
            description="رابط لملف صوتي اختياري — يُعرض كمشغّل صوت داخل صفحة المقال"
          />

          <div className="space-y-2">
            <Label htmlFor="audioUrl">Audio Version URL</Label>
            <Input
              id="audioUrl"
              type="url"
              placeholder="https://..."
              value={formData.audioUrl || ''}
              onChange={(e) => updateField('audioUrl', e.target.value || null)}
            />
            <p className="text-xs text-muted-foreground">
              Displays &quot;نسخة صوتية&quot; badge + audio player on the article page
            </p>
          </div>
        </section>

        <div className="border-t" />

        {/* ─────────────────────────────────────────────
            Section 3 — معرض الصور
            ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <SectionHeader
            icon={Library}
            title="معرض الصور"
            description="حتى 10 صور إضافية تُعرض داخل المقال (carousel/grid)"
          />

          {!formData.clientId ? (
            <ClientRequiredEmptyState goToBasic={goToBasic} />
          ) : (
            <ImageGalleryManager
              clientId={formData.clientId}
              gallery={formData.gallery || []}
              onGalleryChange={(gallery) => updateField('gallery', gallery)}
              disabled={!formData.clientId}
            />
          )}
        </section>
      </CardContent>
    </Card>
  );
}
