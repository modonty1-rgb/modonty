'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { FormInput, FormTextarea, FormNativeSelect } from '@/components/admin/form-field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CharacterCounter } from '@/components/shared/character-counter';
import { TagMultiSelect } from '../tag-multi-select';
import { ClientLogoPreview } from '../client-logo-preview';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function BasicSection() {
  const { formData, updateField, errors, clients, categories, tags, authors } = useArticleForm();
  const [slugCopied, setSlugCopied] = useState(false);

  // Find selected client with logo data
  const selectedClient = clients.find((c) => c.id === formData.clientId);
  const hasPublisherLogo = !!selectedClient?.logoMedia?.url;

  const handleCopySlug = async () => {
    if (formData.slug) {
      try {
        await navigator.clipboard.writeText(formData.slug);
        setSlugCopied(true);
        setTimeout(() => setSlugCopied(false), 2000);
      } catch (error) {
        // Ignore clipboard errors
      }
    }
  };

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
                        <Link
                          href={`/clients/${selectedClient.id}/edit`}
                          className="font-medium underline underline-offset-4 hover:text-amber-700 dark:hover:text-amber-200"
                        >
                          Add logo
                        </Link>
                      </AlertDescription>
                    </Alert>
                  )}
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
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-xs text-muted-foreground">
                Optimize for 50-60 characters for better search visibility
              </p>
              <CharacterCounter current={formData.title?.length || 0} max={60} />
            </div>
            {errors.title?.[0] && (
              <p className="text-sm text-destructive">{errors.title[0]}</p>
            )}
          </div>

          {formData.slug && (
            <div className="flex items-center gap-2">
              <Label>Slug</Label>
              <Badge variant="outline" className="font-mono text-sm px-3 py-1.5">
                {formData.slug}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopySlug}
                className="h-8 w-8 p-0"
              >
                {slugCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <input type="hidden" name="slug" value={formData.slug} />
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
