'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ArticleFormData, FormSubmitResult } from '@/lib/types/form-types';
import { ArticleStatus } from '@prisma/client';
import { slugify } from '../helpers/seo-helpers';
import type { FullPageValidationResult } from '@/lib/seo/types';
import {
  FileText,
  Edit,
  Link,
  Search,
  Share2,
  Settings,
  Image,
  Tag,
  Code,
  CheckCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SectionConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  anchor: string;
}

interface ArticleFormStore {
  // Mode (always 'new' for article creation)
  mode: 'new';

  // Form Data (keep all existing fields)
  formData: ArticleFormData;
  updateField: (field: keyof ArticleFormData, value: any) => void;
  updateFields: (fields: Partial<ArticleFormData>) => void;
  syncFormData: (data: ArticleFormData, dirty: boolean) => void;
  resetForm: () => void;
  initializeForm: (data: Partial<ArticleFormData>) => void;

  // UI State
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Actions
  save: () => Promise<FormSubmitResult>;
  isSaving: boolean;
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;

  // Validation (FormSubmitResult uses error string, but we also track field-level errors)
  errors: Record<string, string[]>;
  setErrors: (errors: Record<string, string[]>) => void;
  clearError: (field: string) => void;

  // Data
  clients: Array<{ id: string; name: string; slug?: string }>;
  categories: Array<{ id: string; name: string; slug?: string }>;
  authors: Array<{ id: string; name: string }>;
  setData: (data: {
    clients: Array<{ id: string; name: string; slug?: string }>;
    categories: Array<{ id: string; name: string; slug?: string }>;
    authors: Array<{ id: string; name: string }>;
  }) => void;

  // Actions callback
  onSubmit?: (data: ArticleFormData) => Promise<FormSubmitResult>;
  setOnSubmit: (onSubmit: (data: ArticleFormData) => Promise<FormSubmitResult>) => void;

  // Validation state
  validationResults: FullPageValidationResult | null;
  isValidating: boolean;
  validationError: string | null;
  validateArticle: () => Promise<FullPageValidationResult>;

  // Publish state
  isPublishing: boolean;
  publishError: string | null;
  publishArticle: () => Promise<FormSubmitResult>;
}

const initialFormData: ArticleFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  contentFormat: 'rich_text',
  clientId: '',
  categoryId: '',
  authorId: '',
  status: 'WRITING',
  featured: false,
  scheduledAt: null,
  seoTitle: '',
  seoDescription: '',
  metaRobots: 'index, follow',
  ogTitle: '',
  ogDescription: '',
  ogSiteName: 'مودونتي',
  ogLocale: 'ar_SA',
  ogArticleAuthor: '',
  ogArticleSection: '',
  ogArticleTag: [],
  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterSite: '',
  twitterCreator: '',
  canonicalUrl: '',
  sitemapPriority: 0.5,
  sitemapChangeFreq: 'weekly',
  license: '',
  lastReviewed: null,
  featuredImageId: null,
  tags: [],
  faqs: [],
};

export const useArticleFormStore = create<ArticleFormStore>()(
  devtools(
    (set, get) => ({
        // Initial State
        mode: 'new',
        formData: initialFormData,
        activeSection: 'basic',
        sidebarCollapsed: false,
        isSaving: false,
        isDirty: false,
        errors: {},
        clients: [],
        categories: [],
        authors: [],
        onSubmit: undefined,
        validationResults: null,
        isValidating: false,
        validationError: null,
        isPublishing: false,
        publishError: null,

        // Initialize form
        initializeForm: (data) => {
          set(
            {
              mode: 'new',
              formData: { ...initialFormData, ...data },
              isDirty: false,
              errors: {},
            },
            false,
            'initializeForm',
          );
        },

        // Reset form
        resetForm: () => {
          set(
            {
              formData: initialFormData,
              isDirty: false,
              errors: {},
              activeSection: 'basic',
            },
            false,
            'resetForm',
          );
        },

        // Update field
        updateField: (field, value) => {
          set(
            (state) => {
              const newErrors = { ...state.errors };
              delete newErrors[field];
              
              // Auto-fill logic for slug
              if (field === 'title' && !state.formData.slug) {
                const newSlug = slugify(value);
                return {
                  formData: { ...state.formData, [field]: value, slug: newSlug },
                  isDirty: true,
                  errors: newErrors,
                };
              }

              return {
                formData: { ...state.formData, [field]: value },
                isDirty: true,
                errors: newErrors,
              };
            },
            false,
            `updateField: ${String(field)}`,
          );

          // Trigger other auto-fill logic via effects (handled in components)
        },

        // Update multiple fields
        updateFields: (fields) => {
          set(
            (state) => ({
              formData: { ...state.formData, ...fields },
              isDirty: true,
            }),
            false,
            'updateFields',
          );
        },

        // Sync formData from context without changing isDirty unnecessarily
        syncFormData: (data, dirty) => {
          set(
            (state) => ({
              formData: data,
              isDirty: dirty,
            }),
            false,
            'syncFormData',
          );
        },

        // Set active section
        setActiveSection: (section) => {
          set({ activeSection: section }, false, 'setActiveSection');

          // Scroll to section
          setTimeout(() => {
            const element = document.getElementById(section);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        },

        // Toggle sidebar
        toggleSidebar: () => {
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }), false, 'toggleSidebar');
        },

        // Save
        save: async () => {
          const state = get();
          if (!state.onSubmit) {
            return { success: false, error: 'No submit handler set' };
          }

          set({ isSaving: true }, false, 'save:start');

          try {
            const result = await state.onSubmit(state.formData);

            if (result.success) {
              set({ isDirty: false, errors: {} }, false, 'save:success');
            } else {
              // Convert error to errors format
              const errors: Record<string, string[]> = result.error ? { _general: [result.error] } : {};
              set({ errors }, false, 'save:error');
            }

            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save article';
            set({ errors: { _general: [errorMessage] } }, false, 'save:exception');
            return { success: false, error: errorMessage };
          } finally {
            set({ isSaving: false }, false, 'save:complete');
          }
        },

        // Set dirty state
        setDirty: (dirty) => {
          set({ isDirty: dirty }, false, 'setDirty');
        },

        // Set errors
        setErrors: (errors) => {
          set({ errors }, false, 'setErrors');
        },

        // Clear error
        clearError: (field) => {
          set(
            (state) => {
              const newErrors = { ...state.errors };
              delete newErrors[field];
              return { errors: newErrors };
            },
            false,
            `clearError: ${field}`,
          );
        },

        // Set data
        setData: (data) => {
          set({ ...data }, false, 'setData');
        },

        // Set submit handler
        setOnSubmit: (onSubmit) => {
          set({ onSubmit }, false, 'setOnSubmit');
        },

        // Validate article (for new articles, validation happens after saving)
        validateArticle: async () => {
          set({ isValidating: true, validationError: null }, false, 'validateArticle:start');

          try {
            throw new Error('Validation is only available after saving the article. Please save the article first.');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to validate article';
            set({ validationError: errorMessage }, false, 'validateArticle:error');
            throw error;
          } finally {
            set({ isValidating: false }, false, 'validateArticle:complete');
          }
        },

        // Publish article (uses publishArticle action for new articles)
        publishArticle: async () => {
          const state = get();
          set({ isPublishing: true, publishError: null }, false, 'publishArticle:start');

          try {
            if (!state.onSubmit) {
              return { success: false, error: 'Submit handler not set. Please save the article first.' };
            }

            const publishActionModule = await import('../actions/publish-action');
            if (!('publishArticle' in publishActionModule) || typeof publishActionModule.publishArticle !== 'function') {
              return { success: false, error: 'Publish action not available' };
            }
            const result = await publishActionModule.publishArticle(state.formData);

            if (result.success) {
              set(
                {
                  isDirty: false,
                  errors: {},
                  publishError: null,
                },
                false,
                'publishArticle:success',
              );
            } else {
              set({ publishError: result.error || 'Failed to publish article' }, false, 'publishArticle:error');
            }

            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to publish article';
            set({ publishError: errorMessage }, false, 'publishArticle:exception');
            return { success: false, error: errorMessage };
          } finally {
            set({ isPublishing: false }, false, 'publishArticle:complete');
          }
        },
    }),
    { name: 'ArticleFormStore' },
  ),
);

// Sections configuration helper
export const getSections = (): SectionConfig[] => {
  return [
    { id: 'basic', label: 'Basic Info', icon: FileText, anchor: '#basic' },
    { id: 'content', label: 'Content', icon: Edit, anchor: '#content' },
    { id: 'meta', label: 'Meta & Relations', icon: Link, anchor: '#meta' },
    { id: 'seo', label: 'SEO Meta', icon: Search, anchor: '#seo' },
    { id: 'social', label: 'Social Media', icon: Share2, anchor: '#social' },
    { id: 'technical', label: 'Technical SEO', icon: Settings, anchor: '#technical' },
    { id: 'media', label: 'Media', icon: Image, anchor: '#media' },
    { id: 'tags', label: 'Tags & FAQs', icon: Tag, anchor: '#tags' },
    {
      id: 'seo-validation',
      label: 'SEO & Validation',
      icon: CheckCircle,
      anchor: '#seo-validation',
    },
  ];
};
