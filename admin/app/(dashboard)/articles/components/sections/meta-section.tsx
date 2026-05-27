'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getStatusLabel } from '../../helpers/status-utils';
import { Badge } from '@/components/ui/badge';

export function MetaSection() {
  const { formData, updateField } = useArticleForm();

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {formData.status && (
          <div className="space-y-2">
            <Label>الحالة الحالية</Label>
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
                لتغيير الحالة، استخدم شاشة Workflow
              </span>
            </div>
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
            إبراز على الرئيسية
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
