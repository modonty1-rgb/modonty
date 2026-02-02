import { ArticleFormData } from '@/lib/types/form-types';

export interface SectionStatus {
  completed: boolean;
  hasErrors: boolean;
}

export function getSectionStatus(
  sectionId: string,
  formData: ArticleFormData,
  errors: Record<string, string[]>
): SectionStatus {
  switch (sectionId) {
    case 'basic':
      return {
        completed: !!(formData.title && formData.clientId),
        hasErrors: !!(
          errors.title ||
          errors.excerpt ||
          errors.clientId ||
          errors.categoryId ||
          errors.slug ||
          errors.tags
        ),
      };
    case 'content':
      return {
        completed: !!formData.content,
        hasErrors: !!errors.content,
      };
    case 'seo':
      return {
        completed: !!(formData.seoTitle && formData.seoDescription),
        hasErrors: !!(
          errors.seoTitle ||
          errors.seoDescription ||
          errors.canonicalUrl ||
          errors.metaRobots
        ),
      };
    case 'media':
      return {
        completed: true,
        hasErrors: !!errors.featuredImageId,
      };
    case 'tags':
      return {
        completed: true,
        hasErrors: !!(errors.tags || errors.faqs),
      };
    case 'seo-validation':
      return {
        completed: true,
        hasErrors: false,
      };
    default:
      return {
        completed: false,
        hasErrors: false,
      };
  }
}
