import { z } from "zod";

export const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
  seoTitle: z.string().max(60, "SEO title must be 60 characters or less").optional(),
  seoDescription: z.string().max(160, "SEO description must be 160 characters or less").optional(),
  lastReviewed: z.date().optional(),
  reviewedBy: z.string().optional(),
  author: z.string().optional(),
  upvoteCount: z.number().int().min(0).optional(),
  answerCount: z.number().int().min(0).optional(),
  dateCreated: z.date().optional(),
  datePublished: z.date().optional(),
  inLanguage: z.string().default("ar"),
  speakable: z.any().optional(),
  mainEntity: z.any().optional(),
});

export type FAQFormData = z.infer<typeof faqSchema>;
