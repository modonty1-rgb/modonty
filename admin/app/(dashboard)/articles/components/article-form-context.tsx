'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { ArticleFormData, FormSubmitResult } from '@/lib/types/form-types';
import { slugify, generateSEOTitle, generateSEODescription, generateCanonicalUrl } from '../helpers/seo-helpers';
import { SITE_NAME } from '@/lib/constants/site-name';
import { updateArticle } from '../actions/articles-actions';
import {
  FileText,
  Edit,
  Search,
  Image,
  Tag,
  CheckCircle,
  Code,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { calculateStepValidation, calculateOverallProgress, STEP_CONFIGS, type StepValidation } from '../helpers/step-validation-helpers';
import { analyzeArticleSEO } from '../analyzer';

export interface SectionConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

type ArticleClient = {
  id: string;
  name: string;
  slug?: string;
  logoMediaId?: string | null;
  logoMedia?: {
    url: string;
    width?: number | null;
    height?: number | null;
  } | null;
};

interface ArticleFormContextType {
  // Mode ('new' for article creation, 'edit' for editing)
  mode: 'new' | 'edit';

  // Form Data
  formData: ArticleFormData;
  updateField: (field: keyof ArticleFormData, value: ArticleFormData[keyof ArticleFormData]) => void;
  updateFields: (fields: Partial<ArticleFormData>) => void;

  // Actions
  save: () => Promise<FormSubmitResult>;
  isSaving: boolean;
  isDirty: boolean;
  lastAutoSaved: Date | null;

  // Validation
  errors: Record<string, string[]>;
  setErrors: (errors: Record<string, string[]>) => void;

  // Step Navigation
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;

  // Navigation (legacy - for backward compatibility)
  sections: SectionConfig[];
  getSectionHref: (section: string) => string;

  // Data
  clients: ArticleClient[];
  categories: Array<{ id: string; name: string; slug?: string }>;
  authors: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;

  // Validation
  getStepValidation: (stepNumber: number) => StepValidation;
  overallProgress: number;
  seoScore: number;

  // DB snapshot for MetaTag & JSON-LD tab (edit only)
  dbMetaAndJsonLd: { nextjsMetadata: Record<string, unknown> | null; jsonLdStructuredData: string | null };
}

const ArticleFormContext = createContext<ArticleFormContextType | undefined>(undefined);

/** Partial form data for SOT-from-Settings fields used in the form (display only; not persisted to Article). */
export type SettingsArticleDefaults = Partial<Pick<
  ArticleFormData,
  | 'inLanguage' | 'metaRobots' | 'ogType' | 'ogLocale' | 'twitterCard' | 'twitterSite' | 'twitterCreator'
  | 'sitemapPriority' | 'sitemapChangeFreq' | 'license' | 'isAccessibleForFree'
  | 'contentFormat'
>>;

interface ArticleFormProviderProps {
  children: ReactNode;
  initialData?: Partial<ArticleFormData>;
  /** Article defaults from Settings (SOT). Merged last so these always win for the 12 fields. */
  settingsArticleDefaults?: SettingsArticleDefaults;
  onSubmit: (data: ArticleFormData) => Promise<FormSubmitResult>;
  clients: ArticleClient[];
  categories: Array<{ id: string; name: string; slug?: string }>;
  authors: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
  articleId?: string;
  dbMetaAndJsonLd?: { nextjsMetadata: Record<string, unknown> | null; jsonLdStructuredData: string | null };
}

const initialFormData: ArticleFormData = {
  // Basic Content
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  contentFormat: 'rich_text',
  
  // Relationships
  clientId: '',
  categoryId: '',
  authorId: '',
  
  // Status & Workflow
  status: 'WRITING',
  featured: false,
  scheduledAt: null,
  
  // Schema.org Article - Core Fields
  datePublished: null,
  lastReviewed: null,
  mainEntityOfPage: '',
  
  // Schema.org Article - Extended Fields
  wordCount: undefined,
  readingTimeMinutes: undefined,
  contentDepth: '',
  inLanguage: 'ar',
  isAccessibleForFree: true,
  license: "none",
  
  // SEO Meta Tags
  seoTitle: '',
  seoDescription: '',
  metaRobots: 'index, follow',
  
  // Open Graph (Complete) — OG URL derived from canonicalUrl (SOT)
  ogTitle: '',
  ogDescription: '',
  ogType: 'article',
  ogSiteName: SITE_NAME,
  ogLocale: 'ar_SA',
  ogArticleAuthor: '',
  ogArticlePublishedTime: null,
  ogArticleModifiedTime: null,
  ogArticleSection: '',
  ogArticleTag: [],
  
  // Twitter Cards (Complete)
  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterSite: '',
  twitterCreator: '',
  
  // Technical SEO
  canonicalUrl: '',
  sitemapPriority: 0.5,
  sitemapChangeFreq: 'weekly',
  
  // Breadcrumb Support
  breadcrumbPath: undefined,
  
  // Featured Media
  featuredImageId: null,
  featuredImageAlt: null,
  gallery: [],
  
  // JSON-LD Structured Data
  jsonLdStructuredData: '',
  jsonLdLastGenerated: null,
  jsonLdValidationReport: undefined,
  
  // Content for Structured Data
  articleBodyText: '',
  
  // Semantic Enhancement
  semanticKeywords: undefined,
  
  // E-E-A-T Enhancement
  citations: [],

  // SEO keywords the article is based on (reference)
  seoKeywords: [],
  
  // Schema Versioning
  jsonLdVersion: 1,
  jsonLdHistory: undefined,
  jsonLdDiffSummary: '',
  // Tags & FAQs
  tags: [],
  faqs: [],
  
  // Related Articles
  relatedArticles: [],
};

export function ArticleFormProvider({
  children,
  initialData,
  settingsArticleDefaults,
  dbMetaAndJsonLd: dbMetaAndJsonLdProp,
  onSubmit,
  clients,
  categories,
  authors,
  tags,
  articleId,
}: ArticleFormProviderProps) {
  const dbMetaAndJsonLd = dbMetaAndJsonLdProp ?? { nextjsMetadata: null, jsonLdStructuredData: null };
  const mode: 'new' | 'edit' = articleId ? 'edit' : 'new';
  const [formData, setFormData] = useState<ArticleFormData>(() => {
    const initial = {
      ...initialFormData,
      ...initialData,
      ...settingsArticleDefaults,
    };
    // Auto-set authorId if not set and there's only one author (singleton Modonty)
    if (!initial.authorId && authors.length === 1 && mode === 'new') {
      initial.authorId = authors[0].id;
    }
    return initial;
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  const totalSteps = STEP_CONFIGS.length;

  const getStepValidation = useCallback(
    (stepNumber: number) => calculateStepValidation(stepNumber, formData, errors),
    [formData, errors]
  );

  const [seoScore, setSeoScore] = useState<number>(0);

  const overallProgress = calculateOverallProgress(formData, errors, seoScore);

  // Update SEO score in real-time (debounced to avoid excessive recalculation)
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = analyzeArticleSEO(formData);
      setSeoScore(result.score);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  // Get section href (mode-aware)
  const getSectionHref = useCallback(
    (section: string) => {
      if (mode === 'edit' && articleId) {
        return `/articles/${articleId}/edit`;
      }
      return `/articles/new`;
    },
    [mode, articleId],
  );

  // Sections configuration
  const sections: SectionConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: FileText, href: getSectionHref('basic') },
    { id: 'content', label: 'Content', icon: Edit, href: getSectionHref('content') },
    { id: 'media', label: 'Media', icon: Image, href: getSectionHref('media') },
    { id: 'tags', label: 'Tags & FAQs', icon: Tag, href: getSectionHref('tags') },
    { id: 'seo', label: 'Technical SEO', icon: Search, href: getSectionHref('seo') },
    { id: 'seo-validation', label: 'SEO & Validation', icon: CheckCircle, href: getSectionHref('seo-validation') },
  ];

  const updateField = useCallback((field: keyof ArticleFormData, value: ArticleFormData[keyof ArticleFormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    // Note: Store sync happens via debounced useEffect below
  }, []);

  const updateFields = useCallback((fields: Partial<ArticleFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setIsDirty(true);
    // Note: Store sync happens via debounced useEffect below
  }, []);

  const save = useCallback(async () => {
    setIsSaving(true);
    isSavingRef.current = true;
    try {
      const result = articleId
        ? await updateArticle(articleId, formData)
        : await onSubmit(formData);
      if (result.success) {
        setIsDirty(false);
        setErrors({});
        // Update updatedAt to match server — prevents optimistic locking conflict on next save
        if (result.article?.updatedAt) {
          setFormData((prev) => ({ ...prev, updatedAt: result.article!.updatedAt }));
        }
      } else {
        const errorObj: Record<string, string[]> = result.error ? { _general: [result.error] } : {};
        setErrors(errorObj);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save article';
      setErrors({ _general: [errorMessage] });
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, [formData, onSubmit, articleId]);

  // Unsaved changes warning — prevent accidental navigation
  const isSavingRef = useRef(false);
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Skip warning if we're in the middle of saving (redirect after save)
      if (isSavingRef.current) return;
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Auto-save state
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save every 30 seconds when dirty (edit mode only)
  useEffect(() => {
    if (mode !== 'edit' || !isDirty || isSaving) return;

    autoSaveTimerRef.current = setTimeout(async () => {
      const result = await save();
      if (result.success) {
        setLastAutoSaved(new Date());
      }
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [mode, isDirty, isSaving, save]);

  // Step navigation methods
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const canGoNext = currentStep < totalSteps;
  const canGoPrevious = currentStep > 1;
  
  // Auto-fill logic (no setIsDirty — these are system-generated, not user changes)
  useEffect(() => {
    const newSlug = slugify(formData.title);
    if (newSlug && newSlug !== formData.slug && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, formData.slug]);

  // Auto-fill SEO title from title (if empty)
  useEffect(() => {
    if (formData.title && !formData.seoTitle) {
      const selectedClient = clients.find((c) => c.id === formData.clientId);
      const clientName = selectedClient?.name;
      const seoTitle = generateSEOTitle(formData.title, clientName);
      if (seoTitle) {
        setFormData((prev) => ({ ...prev, seoTitle }));
      }
    }
  }, [formData.title, formData.seoTitle, formData.clientId, clients]);

  // Auto-fill SEO description from excerpt (if empty)
  useEffect(() => {
    if (formData.excerpt && !formData.seoDescription) {
      const seoDescription = generateSEODescription(formData.excerpt);
      if (seoDescription) {
        setFormData((prev) => ({ ...prev, seoDescription }));
      }
    }
  }, [formData.excerpt, formData.seoDescription]);

  // Auto-fill canonical URL from slug (if empty)
  useEffect(() => {
    if (formData.slug && !formData.canonicalUrl) {
      const selectedClient = clients.find((c) => c.id === formData.clientId);
      const clientSlug = selectedClient?.slug;
      const canonicalUrl = generateCanonicalUrl(formData.slug, undefined, clientSlug);
      if (canonicalUrl) {
        setFormData((prev) => ({ ...prev, canonicalUrl }));
      }
    }
  }, [formData.slug, formData.canonicalUrl, formData.clientId, clients]);

  // Auto-fill Sitemap Priority from Featured (if empty)
  useEffect(() => {
    if (formData.featured !== undefined) {
      const newPriority = formData.featured ? 0.8 : 0.5;
      if (formData.sitemapPriority !== newPriority) {
        setFormData((prev) => ({ ...prev, sitemapPriority: newPriority }));
      }
    }
  }, [formData.featured, formData.sitemapPriority]);

  // Auto-fill OG Article Section from Category (if empty)
  useEffect(() => {
    if (formData.categoryId && !formData.ogArticleSection) {
      const selectedCategory = categories.find((c) => c.id === formData.categoryId);
      if (selectedCategory?.name) {
        setFormData((prev) => ({ ...prev, ogArticleSection: selectedCategory.name }));
      }
    }
  }, [formData.categoryId, formData.ogArticleSection, categories]);

  // Auto-fill OG Article Tags from Tags (if empty)
  useEffect(() => {
    if (formData.tags && formData.tags.length > 0 && (!formData.ogArticleTag || formData.ogArticleTag.length === 0)) {
      const selectedTags = tags.filter((t) => formData.tags?.includes(t.id)).map((t) => t.name);
      if (selectedTags.length > 0) {
        setFormData((prev) => ({ ...prev, ogArticleTag: selectedTags }));
      }
    }
  }, [formData.tags, formData.ogArticleTag, tags]);

  // Auto-set singleton author (Modonty) if not set
  useEffect(() => {
    if (!formData.authorId && authors.length === 1 && mode === 'new') {
      setFormData((prev) => ({ ...prev, authorId: authors[0].id }));
      setIsDirty(false); // Don't mark as dirty for auto-set singleton
    }
  }, [formData.authorId, authors, mode]);

  // Auto-fill OG Article Author from Author (if empty)
  useEffect(() => {
    if (formData.authorId && !formData.ogArticleAuthor) {
      const selectedAuthor = authors.find((a) => a.id === formData.authorId);
      if (selectedAuthor?.name) {
        setFormData((prev) => ({ ...prev, ogArticleAuthor: selectedAuthor.name }));
      }
    }
  }, [formData.authorId, formData.ogArticleAuthor, authors]);

  // Auto-fill OG URL from Canonical URL (if empty)
  // Auto-fill articleBodyText from content (extract plain text from TipTap HTML)
  useEffect(() => {
    if (formData.content) {
      // Extract plain text from HTML content (TipTap outputs HTML via editor.getHTML())
      // Use browser's DOMParser for client-side extraction
      if (typeof window !== 'undefined') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formData.content;
        const plainText = (tempDiv.textContent || tempDiv.innerText || '').trim();
        
        // Update articleBodyText with extracted plain text
        if (plainText && (!formData.articleBodyText || formData.articleBodyText !== plainText)) {
          setFormData((prev) => ({ ...prev, articleBodyText: plainText }));
        }
      }
    }
  }, [formData.content]);

  const value: ArticleFormContextType = {
    mode,
    formData,
    updateField,
    updateFields,
    save,
    isSaving,
    isDirty,
    lastAutoSaved,
    errors,
    setErrors,
    currentStep,
    totalSteps,
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    sections,
    getSectionHref,
    clients,
    categories,
    authors,
    tags,
    getStepValidation,
    overallProgress,
    seoScore,
    dbMetaAndJsonLd,
  };

  return <ArticleFormContext.Provider value={value}>{children}</ArticleFormContext.Provider>;
}

export function useArticleForm() {
  const context = useContext(ArticleFormContext);
  if (!context) {
    throw new Error('useArticleForm must be used within ArticleFormProvider');
  }
  return context;
}
