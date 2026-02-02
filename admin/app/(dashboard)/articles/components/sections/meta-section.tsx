'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { FormNativeSelect } from '@/components/admin/form-field';
import { Label } from '@/components/ui/label';
import { ArticleStatus } from '@prisma/client';
import { getStatusLabel, getAvailableStatuses } from '../../helpers/status-utils';
import { Badge } from '@/components/ui/badge';

export function MetaSection() {
  const { formData, updateField } = useArticleForm();

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <FormNativeSelect
          label="الحالة"
          name="status"
          value={formData.status}
          onChange={(e) => updateField('status', e.target.value as ArticleStatus)}
          required
        >
          {getAvailableStatuses().map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </FormNativeSelect>

        {formData.status && (
          <div className="flex items-center gap-2">
            <Badge
              variant={
                formData.status === 'PUBLISHED'
                  ? 'default'
                  : formData.status === 'DRAFT'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {getStatusLabel(formData.status)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formData.status === 'PUBLISHED'
                ? 'المقال منشور ومتاح للجمهور'
                : formData.status === 'DRAFT'
                  ? 'المقال في مسودة وليس منشوراً'
                  : 'المقال مؤرشف'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured || false}
            onChange={(e) => updateField('featured', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="featured" className="cursor-pointer">
            مميز
          </Label>
          {formData.featured && (
            <Badge variant="default" className="ml-2">
              مفعّل
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
