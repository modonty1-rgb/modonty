'use client';

import { useEffect } from 'react';
import { useArticleForm } from './article-form-context';
import {
  generateSEOTitle,
  generateSEODescription,
  generateCanonicalUrl,
} from '../helpers/seo-helpers';

/**
 * Auto-fill hook that preserves all existing auto-fill logic
 * This hook handles all the useEffect logic for auto-filling fields
 */
export function useArticleFormAutoFill() {
  const { formData, updateField, updateFields, clients, categories } = useArticleForm();

  const selectedClient = clients.find((c) => c.id === formData.clientId);

  // Auto-fill SEO title from title (if empty)
  useEffect(() => {
    if (formData.title && !formData.seoTitle) {
      const clientName = selectedClient?.name;
      updateField('seoTitle', generateSEOTitle(formData.title, clientName));
    }
  }, [formData.title, formData.seoTitle, selectedClient, updateField]);

  // Auto-fill SEO description from excerpt (if empty)
  useEffect(() => {
    if (formData.excerpt && !formData.seoDescription) {
      updateField('seoDescription', generateSEODescription(formData.excerpt));
    }
  }, [formData.excerpt, formData.seoDescription, updateField]);

  // Auto-fill canonical URL from slug (if empty)
  useEffect(() => {
    if (formData.slug && !formData.canonicalUrl) {
      const clientSlug = selectedClient?.slug;
      updateField('canonicalUrl', generateCanonicalUrl(formData.slug, undefined, clientSlug));
    }
  }, [formData.slug, formData.canonicalUrl, selectedClient, updateField]);

  // Social meta (Open Graph & Twitter) are now derived at render time
  // from SEO fields, canonical URL, category, tags, and featured image.
}
