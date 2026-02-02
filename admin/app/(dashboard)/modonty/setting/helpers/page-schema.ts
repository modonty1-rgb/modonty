import { z } from "zod";

const metaRobotsEnum = z.enum(["index, follow", "index, nofollow", "noindex, follow", "noindex, nofollow"], {
  errorMap: () => ({ message: "Invalid meta robots value" }),
});
const twitterCardEnum = z.enum(["summary_large_image", "summary"], {
  errorMap: () => ({ message: "Invalid Twitter card type" }),
});
const sitemapChangeFreqEnum = z.enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"], {
  errorMap: () => ({ message: "Invalid sitemap change frequency" }),
});

export const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  heroImage: z.string().optional(),
  heroImageAlt: z.string().optional(),
  heroImageCloudinaryPublicId: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaRobots: z.union([metaRobotsEnum, z.literal("")]).optional(),
  googlebot: z.string().optional(),
  themeColor: z.string().optional(),
  author: z.string().optional(),
  socialImage: z.string().optional(),
  socialImageAlt: z.string().optional(),
  cloudinaryPublicId: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogType: z.string().optional(),
  ogUrl: z.string().url().optional().or(z.literal("")),
  ogSiteName: z.string().optional(),
  ogLocale: z.string().optional(),
  ogImage: z.string().optional(),
  ogImageAlt: z.string().optional(),
  ogImageSecureUrl: z.union([z.string().url(), z.literal("")]).optional(),
  ogImageType: z.string().optional(),
  ogImageWidth: z.number().int().min(1).optional(),
  ogImageHeight: z.number().int().min(1).optional(),
  ogLocaleAlternate: z.string().optional(),
  ogDeterminer: z.string().optional(),
  twitterCard: z.union([twitterCardEnum, z.literal("")]).optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterSite: z.string().optional(),
  twitterCreator: z.string().optional(),
  twitterImage: z.string().optional(),
  twitterImageAlt: z.string().optional(),
  canonicalUrl: z.union([z.string().url(), z.literal("")]).optional(),
  alternateLanguages: z.any().optional(),
  sitemapPriority: z.number().min(0).max(1).optional(),
  sitemapChangeFreq: z.union([sitemapChangeFreqEnum, z.literal("")]).optional(),
  inLanguage: z.string().optional(),
  organizationSeo: z
    .object({
      headline: z.string().optional(),
      sameAs: z.string().optional(),
      contactType: z.string().optional(),
      contactEmail: z.string().optional(),
      contactTelephone: z.string().optional(),
      areaServed: z.string().optional(),
      streetAddress: z.string().optional(),
      addressLocality: z.string().optional(),
      addressRegion: z.string().optional(),
      postalCode: z.string().optional(),
      addressCountry: z.string().optional(),
      geoLatitude: z.union([z.number(), z.string()]).optional(),
      geoLongitude: z.union([z.number(), z.string()]).optional(),
      searchUrlTemplate: z.string().optional(),
      knowsLanguage: z.string().optional(),
      organizationLogoUrl: z.string().optional(),
    })
    .optional(),
});

export type PageFormData = z.infer<typeof pageSchema>;
export type OrganizationSeoForm = NonNullable<PageFormData["organizationSeo"]>;