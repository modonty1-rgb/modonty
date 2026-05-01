import { z } from "zod";

export const articleServerSchema = z.object({
  // Required
  title: z.string().min(1, "عنوان المقال مطلوب").max(300, "العنوان طويل جداً"),
  slug: z.string().min(1, "الرابط المختصر مطلوب").max(300, "الرابط المختصر طويل جداً"),
  content: z.string().min(1, "محتوى المقال مطلوب"),
  clientId: z.string().min(1, "العميل مطلوب"),

  // Optional strings
  excerpt: z.string().max(500).optional().nullable(),
  seoTitle: z.string().max(200, "عنوان SEO طويل جداً").optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  canonicalUrl: z.string().max(500).optional().nullable(),
  ogArticleAuthor: z.string().max(200).optional().nullable(),

  // Optional IDs
  authorId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  featuredImageId: z.string().optional().nullable(),

  // Audio
  audioUrl: z.string().url().optional().nullable().or(z.literal("")),

  // Optional arrays
  tags: z.array(z.string()).optional(),
  citations: z.array(z.string()).optional(),
  seoKeywords: z.array(z.string()).optional(),

  // Status
  status: z.string().optional().nullable(),

  // Dates
  datePublished: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  scheduledAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  lastReviewed: z.union([z.string(), z.date(), z.null()]).optional().nullable(),

  // Boolean
  featured: z.boolean().optional(),

  // Optimistic locking — userVersion (preferred) + updatedAt (legacy/display)
  userVersion: z.number().int().optional(),
  updatedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
}).passthrough();
