'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { FormInput, FormTextarea, FormNativeSelect } from '@/components/admin/form-field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CharacterCounter } from '@/components/shared/character-counter';
import { TagMultiSelect } from '../tag-multi-select';
import { ClientLogoPreview } from '../client-logo-preview';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { ClientLogoModal } from '@/app/(dashboard)/clients/components/client-logo-modal';

export function BasicSection() {
  const { formData, updateField, errors, clients, categories, tags, authors } = useArticleForm();
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  // Find selected client with logo data
  const selectedClient = clients.find((c) => c.id === formData.clientId);
  const hasPublisherLogo = !!selectedClient?.logoMedia?.url;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-[0.7]">
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

              {/* Logo Preview */}
              {selectedClient && (
                <div className="mt-3">
                  <ClientLogoPreview client={selectedClient as Parameters<typeof ClientLogoPreview>[0]['client']} />

                  {/* Missing Logo Alert */}
                  {!hasPublisherLogo && (
                    <Alert variant="default" className="mt-3 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-amber-900 dark:text-amber-100">
                        Publisher logo is missing. This is required for Article rich results.{' '}
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

            <div className="flex-[0.3]">
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
            </div>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={errors.title?.[0] ? 'border-destructive' : ''}
            />
            <div className="flex justify-end mt-1.5">
              <CharacterCounter
                current={formData.title?.length || 0}
                max={80}
                aboveMaxHint="عنوان المقال أفضل إذا كان بين 60–80 حرف — قصير وواضح وجذاب"
              />
            </div>
            {errors.title?.[0] && (
              <p className="text-sm text-destructive">{errors.title[0]}</p>
            )}
          </div>

          {formData.slug && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                الرابط الدائم للمقال — يظهر في جوجل ولا يتغير بعد النشر
              </p>
              <div className="flex items-center gap-2">
                <Label className="shrink-0">Slug</Label>
                <Badge variant="outline" className="font-mono text-sm px-3 py-1.5 flex-1 justify-start truncate">
                  {formData.slug}
                </Badge>
                <input type="hidden" name="slug" value={formData.slug} />
              </div>
              <p className="text-xs text-muted-foreground font-mono ps-1 truncate">
                https://www.modonty.com/articles/{formData.slug}
              </p>
              {formData.slug.length > 50 && (
                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive animate-pulse shrink-0" />
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    الرابط طويل ({formData.slug.length} حرف) — أفضل نتائج SEO تحت 50 حرف
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt || ''}
              onChange={(e) => updateField('excerpt', e.target.value)}
              rows={3}
              className={errors.excerpt?.[0] ? 'border-destructive' : ''}
            />
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-xs text-muted-foreground">
                Optimize for 150-160 characters for better search visibility
              </p>
              <CharacterCounter current={formData.excerpt?.length || 0} max={160} />
            </div>
            {errors.excerpt?.[0] && (
              <p className="text-sm text-destructive">{errors.excerpt[0]}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block">Tags</Label>
            <TagMultiSelect
              availableTags={tags}
              selectedTagIds={formData.tags || []}
              onChange={(tagIds) => updateField('tags', tagIds)}
              placeholder="Select tags"
            />
          </div>

          <div>
            <Label>Author</Label>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <span className="text-sm font-medium">Modonty</span>
              <span className="text-xs text-muted-foreground">(Only author)</span>
            </div>
            <input
              type="hidden"
              name="authorId"
              value={authors?.[0]?.id || formData.authorId || ''}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
