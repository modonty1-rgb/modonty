import { ArticleFormData } from '@/lib/types/form-types';
import { Article } from '../[id]/helpers/article-view-types';

/**
 * Article SEO Analyzer Types
 * 
 * Following SOLID principles:
 * - Interface Segregation: Focused, specific types
 * - Single Responsibility: Each type has one purpose
 */

/**
 * Input type - accepts either Article (from DB) or ArticleFormData (from form)
 */
export type ArticleSEOInput = ArticleFormData | Article;

/**
 * Per-check result for hover card "what & why not complete"
 */
export interface SEOCheckItem {
  passed: boolean;
  label: string;
  reason?: string;
}

/**
 * Category score result
 * Single responsibility: Represents score for one category
 */
export interface ArticleSEOCategory {
  score: number;
  maxScore: number;
  percentage: number;
  passed: number;
  total: number;
  items?: SEOCheckItem[];
}

/**
 * Main SEO score result
 * Open for extension: Can add more fields without breaking existing code
 */
export interface ArticleSEOScoreResult {
  score: number; // Raw score (0-100)
  percentage: number; // Same as score (0-100), for clarity
  categories: {
    metaTags: ArticleSEOCategory;
    content: ArticleSEOCategory;
    images: ArticleSEOCategory;
    structuredData: ArticleSEOCategory;
    technical: ArticleSEOCategory;
    social: ArticleSEOCategory;
  };
  details?: {
    issues: string[];
    recommendations: string[];
  };
}
