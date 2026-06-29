'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FormNativeSelect } from '@/components/admin/form-field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArticleSlugChangeDialog } from '../article-slug-change-dialog';
import { CharacterCounter } from '@/components/shared/character-counter';
import { TagMultiSelect } from '../tag-multi-select';
import { ClientLogoPreview } from '../client-logo-preview';
import { AlertCircle, AlertTriangle, Link2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ClientLogoModal } from '@/app/(dashboard)/clients/components/client-logo-modal';
import { cn, slugify } from '@/lib/utils';

export function BasicSection() {
  const { formData, updateField, errors, clients, categories, tags, authors, mode, articleId } = useArticleForm();
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [slugDialogOpen, setSlugDialogOpen] = useState(false);
  const [slugUnlocked, setSlugUnlocked] = useState(false);

  const isSlugLocked = mode === 'edit' && !slugUnlocked;

  const selectedClient = clients.find((c) => c.id === formData.clientId);
  const hasPublisherLogo = !!selectedClient?.logoMedia?.url;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-5 items-start">

      {/* ── MAIN: Title / Slug / SEO — كرت واحد ── */}
      <Card>
        <CardContent className="pt-5 space-y-4">

          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">
                Title
                <span className="text-destructive ms-1">*</span>
              </Label>
              <CharacterCounter current={formData.title?.length || 0} max={80} />
            </div>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={cn('text-base font-medium h-11', errors.title?.[0] && 'border-destructive')}
              placeholder="العنوان الذي يراه القارئ — H1"
            />
            {errors.title?.[0] && (
              <p className="text-sm text-destructive">{errors.title[0]}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              <Label htmlFor="slug" className="text-sm">Slug</Label>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">الرابط الدائم</Badge>
            </div>

            {isSlugLocked ? (
              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center gap-2">
                <span className="truncate font-mono text-xs text-muted-foreground flex-1" dir="ltr">
                  {formData.slug || '—'}
                </span>
                <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-0.5 text-[10px] font-semibold shrink-0">
                  locked
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-7 text-[11px] border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-600"
                  onClick={() => setSlugDialogOpen(true)}
                >
                  <RefreshCw className="h-3 w-3 me-1" /> Change
                </Button>
              </div>
            ) : (
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                onBlur={(e) => updateField('slug', slugify(e.target.value))}
                className={cn('font-mono text-sm', errors.slug?.[0] && 'border-destructive')}
                placeholder="مثال: افضل-عيادات-الاسنان-جدة"
                dir="ltr"
                autoFocus={slugUnlocked}
              />
            )}

            {formData.slug && (
              <p className="text-[11px] text-muted-foreground font-mono truncate">
                modonty.com/articles/<span className="text-foreground">{slugify(formData.slug)}</span>
              </p>
            )}
            {slugify(formData.slug).length > 50 && (
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {slugify(formData.slug).length} حرف — اختصره تحت 50
                </p>
              </div>
            )}
            {errors.slug?.[0] && (
              <p className="text-sm text-destructive">{errors.slug[0]}</p>
            )}
          </div>

          {/* Slug change — OTP via Telegram (article must be saved/have an ID) */}
          {mode === 'edit' && articleId && (
            <ArticleSlugChangeDialog
              articleId={articleId}
              currentSlug={formData.slug}
              open={slugDialogOpen}
              onOpenChange={(open) => {
                setSlugDialogOpen(open);
                if (!open) setSlugUnlocked(false);
              }}
              onSuccess={(newSlug) => {
                updateField('slug', newSlug);
                setSlugUnlocked(false);
              }}
            />
          )}

          {/* SEO separator */}
          <div className="relative py-1">
            <Separator />
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-card px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                SEO
              </span>
            </span>
          </div>

          {/* SEO Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="seoTitle">
                SEO Title
                <span className="text-destructive ms-1">*</span>
              </Label>
              <CharacterCounter current={(formData.seoTitle || '').length} max={60} />
            </div>
            <Input
              id="seoTitle"
              value={formData.seoTitle || ''}
              onChange={(e) => updateField('seoTitle', e.target.value)}
              placeholder="عنوان جوجل (50–60 حرف)"
              maxLength={60}
              className={cn(errors.seoTitle?.[0] && 'border-destructive')}
            />
            {errors.seoTitle?.[0] && (
              <p className="text-sm text-destructive">{errors.seoTitle[0]}</p>
            )}
          </div>

          {/* SEO Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="seoDescription">
                SEO Description
                <span className="text-destructive ms-1">*</span>
              </Label>
              <CharacterCounter current={(formData.seoDescription || '').length} max={160} />
            </div>
            <Textarea
              id="seoDescription"
              value={formData.seoDescription || ''}
              onChange={(e) => updateField('seoDescription', e.target.value)}
              placeholder="وصف جوجل (120–160 حرف) — يتعبّى تلقائياً كمقتطف عند الحفظ"
              rows={3}
              maxLength={160}
              className={cn(errors.seoDescription?.[0] && 'border-destructive')}
            />
            {errors.seoDescription?.[0] && (
              <p className="text-sm text-destructive">{errors.seoDescription[0]}</p>
            )}
          </div>

        </CardContent>
      </Card>

      {/* ── SIDE: Client / Category / Tags — كرت واحد ── */}
      <Card>
        <CardContent className="pt-4 space-y-4">

          <input
            type="hidden"
            name="authorId"
            value={authors?.[0]?.id || formData.authorId || ''}
          />

          {/* Client */}
          <div className="space-y-1.5">
            <FormNativeSelect
              label="Client"
              name="clientId"
              value={formData.clientId}
              onChange={(e) => updateField('clientId', e.target.value)}
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </FormNativeSelect>

            {selectedClient && (
              <div className="mt-2">
                <ClientLogoPreview
                  client={selectedClient as Parameters<typeof ClientLogoPreview>[0]['client']}
                />
                {!hasPublisherLogo && (
                  <Alert
                    variant="default"
                    className="mt-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-900 dark:text-amber-100 text-xs">
                      Publisher logo is missing.{' '}
                      <button
                        type="button"
                        onClick={() => setLogoModalOpen(true)}
                        className="font-medium underline underline-offset-4 hover:text-amber-700 dark:hover:text-amber-200"
                      >
                        Add logo
                      </button>
                    </AlertDescription>
                  </Alert>
                )}
                <ClientLogoModal
                  open={logoModalOpen}
                  onOpenChange={setLogoModalOpen}
                  clientId={selectedClient.id}
                  initialLogoUrl={selectedClient.logoMedia?.url ?? null}
                  initialLogoMediaId={selectedClient.logoMediaId ?? null}
                />
              </div>
            )}
          </div>

          {/* Category */}
          <FormNativeSelect
            label="Category"
            name="categoryId"
            value={formData.categoryId || ''}
            onChange={(e) => updateField('categoryId', e.target.value)}
          >
            <option value="">None</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </FormNativeSelect>

          {/* YMYL reviewer — read-only hint (reviewer = ymylData.reviewerName, stamped on client approval) */}
          {selectedClient?.isYmyl && (() => {
            const ymylData = selectedClient.ymylData as Record<string, unknown> | null;
            const reviewerName = typeof ymylData?.reviewerName === 'string' ? ymylData.reviewerName : null;
            const reviewerQual = typeof ymylData?.reviewerQualification === 'string' ? ymylData.reviewerQualification : null;
            return (
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">
                  YMYL Reviewer — {selectedClient.ymylCategory ?? 'ymyl'}
                </Label>
                <div className="px-3 py-2 rounded-md border bg-muted/30 text-sm min-h-9 flex flex-col justify-center gap-0.5">
                  {reviewerName ? (
                    <>
                      <span className="font-medium">{reviewerName}</span>
                      {reviewerQual && <span className="text-xs text-muted-foreground">{reviewerQual}</span>}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">— لم يُدخَل بعد في الكونسول —</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">يُختَم تلقائياً عند موافقة العميل — JSON-LD يقرأ من بيانات العميل.</p>
              </div>
            );
          })()}

          <Separator />

          {/* Tags */}
          <TagMultiSelect
            availableTags={tags}
            selectedTagIds={formData.tags || []}
            onChange={(tagIds) => updateField('tags', tagIds)}
            placeholder="Select tags"
          />

          {/* Featured — hidden until needed */}
          <div className="hidden">
            <Separator />
            <div className="flex items-start gap-3 p-3 rounded-md border border-border">
              <Checkbox
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) => updateField('featured', checked === true)}
                className="mt-0.5"
              />
              <div>
                <Label htmlFor="featured" className="cursor-pointer font-medium text-sm">
                  Highlight on Homepage
                  {formData.featured && (
                    <Badge variant="default" className="ms-2 text-[10px]">Enabled</Badge>
                  )}
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  يظهر في الرئيسية — يرفع أولوية Sitemap لـ 0.8
                </p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
