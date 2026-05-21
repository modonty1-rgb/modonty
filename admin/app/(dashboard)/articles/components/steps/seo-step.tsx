'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CharacterCounter } from '@/components/shared/character-counter';
import { useToast } from '@/hooks/use-toast';
import { messages } from '@/lib/messages';
import { extractLinksFromContent } from '../../helpers/link-extraction-helper';
import { TechnicalSEOGuidance } from '../sections/technical-seo-guidance';
import { getMediaById } from '@/app/(dashboard)/media/actions/get-media-by-id';
import { SITE_NAME } from '@/lib/constants/site-name';
import {
  Tag,
  Hash,
  Globe,
  ImageIcon,
  Plus,
  X,
  Link as LinkIcon,
  Loader2,
  Wrench,
  ExternalLink,
} from 'lucide-react';

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
  url: string;
  altText: string | null;
}

export function SEOStep() {
  const { formData, updateField, clients, articleId } = useArticleForm();
  const { toast } = useToast();
  const [featuredMedia, setFeaturedMedia] = useState<FeaturedMedia | null>(null);
  const [citationInput, setCitationInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!formData.featuredImageId || !formData.clientId) {
        setFeaturedMedia(null);
        return;
      }
      try {
        const media = await getMediaById(formData.featuredImageId, formData.clientId);
        if (media) {
          setFeaturedMedia({ url: media.url, altText: media.altText });
        }
      } catch {
        setFeaturedMedia(null);
      }
    };
    fetchMedia();
  }, [formData.featuredImageId, formData.clientId]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modonty.com';
  const effectiveTitle = formData.seoTitle || formData.title || '';
  const effectiveDescription = formData.seoDescription || formData.excerpt || '';
  const effectiveCanonical = formData.canonicalUrl || `${siteUrl}/articles/${formData.slug}`;
  const selectedClient = clients.find((c) => c.id === formData.clientId);
  const hasPreviewData = effectiveTitle && effectiveDescription;

  const citations = formData.citations ?? [];

  const addCitation = useCallback(() => {
    const trimmed = citationInput.trim();
    if (!trimmed) return;
    if (citations.some((c) => c.trim() === trimmed)) return;
    updateField('citations', [...citations, trimmed]);
    setCitationInput('');
  }, [citationInput, citations, updateField]);

  const removeCitation = useCallback(
    (idx: number) => {
      updateField(
        'citations',
        citations.filter((_, i) => i !== idx),
      );
    },
    [citations, updateField],
  );

  const extractAuthSources = useCallback(() => {
    if (!formData.content) {
      toast({
        title: messages.error.operation_failed,
        description: messages.descriptions.article_content_required,
        variant: 'destructive',
      });
      return;
    }
    setIsExtracting(true);
    try {
      const links = extractLinksFromContent(formData.content);
      const auth = links.filter((l) => l.isAuthoritative && l.isExternal).map((l) => l.url);
      const existing = new Set(citations);
      const newOnes = auth.filter((url) => !existing.has(url));
      if (newOnes.length === 0) {
        toast({
          title: messages.success.success,
          description:
            auth.length > 0 ? 'تم إضافة جميع المصادر الموثوقة مسبقاً' : 'لا توجد مصادر موثوقة في المحتوى',
        });
        return;
      }
      updateField('citations', [...citations, ...newOnes]);
      const dups = auth.length - newOnes.length;
      toast({
        title: messages.success.updated,
        description: `تمت إضافة ${newOnes.length} مصدر${dups > 0 ? ` • تم تخطي ${dups} مكرر` : ''}`,
      });
    } catch {
      toast({
        title: messages.error.server_error,
        description: messages.descriptions.citations_error,
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  }, [formData.content, citations, updateField, toast]);

  const titleLen = (formData.seoTitle || '').length;
  const descLen = (formData.seoDescription || '').length;

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────
          SECTION 1 — SEO الأساسي + Search Preview
          ───────────────────────────────────────────── */}
      <Card>
        <CardContent className="space-y-6 pt-6">
          <SectionHeader
            icon={Tag}
            title="SEO الأساسي"
            description="ما يظهر في صفحات نتائج البحث ومنصات التواصل"
          />

          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              value={formData.seoTitle || ''}
              onChange={(e) => updateField('seoTitle', e.target.value)}
              placeholder="عنوان محسّن لمحركات البحث (50–60 حرف)"
              maxLength={60}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                النطاق الأمثل: 50–60 حرف — معيار Google + Semrush
              </p>
              <CharacterCounter current={titleLen} max={60} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea
              id="seoDescription"
              value={formData.seoDescription || ''}
              onChange={(e) => updateField('seoDescription', e.target.value)}
              placeholder="وصف محسّن لمحركات البحث (120–160 حرف)"
              rows={3}
              maxLength={160}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                النطاق الأمثل: 120–160 حرف
              </p>
              <CharacterCounter current={descLen} max={160} />
            </div>
          </div>

          {/* Inline Search Preview */}
          <div className="border-t pt-6 space-y-3">
            <Label className="text-sm font-medium">Search Preview</Label>
            {!hasPreviewData ? (
              <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  أضف عنوان ووصف SEO أعلاه لرؤية المعاينة
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {/* Google */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="h-3 w-3" /> Google
                  </p>
                  <div className="border rounded-lg p-3 space-y-1 bg-background">
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">
                      {effectiveCanonical}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium line-clamp-1">
                      {effectiveTitle}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {effectiveDescription}
                    </div>
                  </div>
                </div>
                {/* Social */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="h-3 w-3" /> Social (Open Graph)
                  </p>
                  <div className="border rounded-lg overflow-hidden bg-background">
                    {featuredMedia?.url ? (
                      <div className="relative aspect-video">
                        <Image
                          src={featuredMedia.url}
                          alt={effectiveTitle}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-muted/50 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-2 space-y-0.5">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {selectedClient?.name || SITE_NAME}
                      </div>
                      <div className="text-xs font-semibold line-clamp-1">{effectiveTitle}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">
                        {effectiveDescription}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────
          SECTION 2 — كلمات ومصادر
          ───────────────────────────────────────────── */}
      <Card>
        <CardContent className="space-y-6 pt-6">
          <SectionHeader
            icon={Hash}
            title="مصادر موثوقة"
            description="روابط مصادر E-E-A-T الموثوقة التي يستند إليها المقال"
          />

          {/* Citations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Citations (E-E-A-T)</Label>
              {citations.length > 0 && (
                <Badge variant="outline" className="font-mono text-xs">
                  {citations.length}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              روابط مصادر خارجية موثوقة — تعزّز E-E-A-T
            </p>
            <div className="flex gap-2">
              <Input
                value={citationInput}
                onChange={(e) => setCitationInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCitation())}
                placeholder="https://..."
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCitation} className="shrink-0 gap-1.5">
                <Plus className="h-4 w-4" />
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={extractAuthSources}
                disabled={isExtracting || !formData.content}
                className="shrink-0 gap-1.5"
              >
                {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                Extract
              </Button>
            </div>
            {citations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {citations.map((url, i) => (
                  <Badge
                    key={`${url}-${i}`}
                    variant="secondary"
                    className="ps-2.5 pe-1 py-1 text-sm font-medium flex items-center gap-1.5"
                  >
                    <span className="truncate max-w-[240px]">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeCitation(i)}
                      className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                      aria-label={`Remove ${url}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────
          SECTION 3 — Health Score (always visible)
          ───────────────────────────────────────────── */}
      <TechnicalSEOGuidance />

      {/* ─────────────────────────────────────────────
          SECTION 4 — رابط للمراجعة التقنية المتقدّمة
          ───────────────────────────────────────────── */}
      {articleId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    المراجعة التقنية والـ Schema
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Canonical · Robots · Open Graph · Twitter · Semantic Keywords · JSON-LD —
                    صفحة dedicated للمراجعة التقنية بعد الانتهاء من الكتابة.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
                <Link href={`/articles/${articleId}/technical`} target="_blank" rel="noopener noreferrer">
                  <Wrench className="h-3.5 w-3.5" />
                  <span>فتح المراجعة التقنية</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
