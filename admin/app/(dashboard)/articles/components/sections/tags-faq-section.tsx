'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FAQBuilder } from '../faq-builder';
import { Badge } from '@/components/ui/badge';

export function TagsFAQSection() {
  const { formData, updateField } = useArticleForm();

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>FAQs</Label>
            {formData.faqs && formData.faqs.length > 0 && (
              <Badge variant="secondary">{formData.faqs.length} questions</Badge>
            )}
          </div>
          <FAQBuilder
            faqs={formData.faqs || []}
            onChange={(faqs) => updateField('faqs', faqs)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
