import { z } from "zod";
import { slugify } from "@/lib/utils";

export const tagServerSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).transform((val) => slugify(val)),
  description: z.string().max(1000).optional().nullable(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().max(500).optional().nullable(),
  socialImage: z.string().optional().nullable(),
  socialImageAlt: z.string().max(300).optional().nullable(),
  socialImageMediaId: z.string().optional().nullable(),
  cloudinaryPublicId: z.string().optional().nullable(),
});
