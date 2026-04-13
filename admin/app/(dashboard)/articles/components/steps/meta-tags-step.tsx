'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CharacterCounter } from '@/components/shared/character-counter';

export function MetaTagsStep() {
  const { formData, updateField } = useArticleForm();

  return (
    <div className="space-y-4">
      {/* SEO Basics */}
      <Card>
        <CardHeader>
          <CardTitle>Meta Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>SEO Title</Label>
            <Input
              value={formData.seoTitle || ''}
              onChange={(e) => updateField('seoTitle', e.target.value)}
              placeholder="عنوان محسّن لمحركات البحث (50–60 حرف)"
              maxLength={60}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                أفضل نطاق: 50–60 حرف — معيار Semrush وGoogle
              </p>
              <CharacterCounter current={(formData.seoTitle || '').length} max={60} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>SEO Description</Label>
            <Textarea
              value={formData.seoDescription || ''}
              onChange={(e) => updateField('seoDescription', e.target.value)}
              placeholder="وصف محسّن لمحركات البحث (120–160 حرف)"
              rows={3}
              maxLength={160}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                أفضل نطاق: 120–160 حرف — معيار Semrush وGoogle
              </p>
              <CharacterCounter current={(formData.seoDescription || '').length} max={160} />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

