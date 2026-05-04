'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FAQBuilder } from '../faq-builder';
import { HelpCircle } from 'lucide-react';

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

export function TagsFAQSection() {
  const { formData, updateField } = useArticleForm();
  const faqs = formData.faqs || [];

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={HelpCircle}
            title="الأسئلة الشائعة"
            description="أسئلة وأجوبة تظهر مع المقال — تستفيد منها FAQ Schema لتظهر في Google rich results"
          />
          {faqs.length > 0 && (
            <Badge variant="outline" className="font-mono text-xs shrink-0">
              {faqs.length}
            </Badge>
          )}
        </div>

        <FAQBuilder
          faqs={faqs}
          onChange={(next) => updateField('faqs', next)}
        />
      </CardContent>
    </Card>
  );
}
