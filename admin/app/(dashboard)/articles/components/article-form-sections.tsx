'use client';

import { useMemo } from 'react';
import { useArticleForm } from './article-form-context';
import { BasicSection } from './sections/basic-section';
import { ContentSection } from './sections/content-section';
import { SEOSection } from './sections/seo-section';
import { MediaSection } from './sections/media-section';
import { TagsFAQSection } from './sections/tags-faq-section';
import { SEOValidationSection } from './sections/seo-validation-section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileText, Edit, Search, Image, Tag, CheckCircle } from 'lucide-react';
import { SectionStatusIndicator } from './section-status-indicator';
import { getSectionStatus } from '../helpers/section-status';

const SECTIONS = [
  { id: 'basic', label: 'Basic Info', icon: FileText, component: BasicSection },
  { id: 'content', label: 'Content', icon: Edit, component: ContentSection },
  { id: 'media', label: 'Media', icon: Image, component: MediaSection },
  { id: 'tags', label: 'Tags & FAQs', icon: Tag, component: TagsFAQSection },
  { id: 'seo', label: 'Technical SEO', icon: Search, component: SEOSection },
  { id: 'seo-validation', label: 'SEO & Validation', icon: CheckCircle, component: SEOValidationSection },
];

export function ArticleFormSections() {
  const { formData, errors } = useArticleForm();

  const sectionsWithStatus = useMemo(() => {
    return SECTIONS.map((section) => ({
      ...section,
      status: getSectionStatus(section.id, formData, errors),
    }));
  }, [formData, errors]);

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="basic"
      className="space-y-4"
      aria-label="Article form sections"
    >
      {sectionsWithStatus.map((section) => {
        const Icon = section.icon;
        const SectionComponent = section.component;
        const statusText = section.status.hasErrors
          ? 'يوجد أخطاء'
          : section.status.completed
            ? 'مكتمل'
            : 'غير مكتمل';

        return (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border rounded-lg bg-card"
          >
            <AccordionTrigger
              className="px-6 py-4 text-base font-semibold hover:no-underline"
              aria-label={`${section.label} - ${statusText}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 text-right">{section.label}</span>
                <SectionStatusIndicator
                  completed={section.status.completed}
                  hasErrors={section.status.hasErrors}
                  aria-label={statusText}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <SectionComponent />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
