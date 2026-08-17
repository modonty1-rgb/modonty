import { db } from "@/lib/db";

/**
 * The industry's own identity — name, description, cover, cached metadata. Partner and
 * article data are fetched separately (`getClientsList` filtered by industry, and
 * `getIndustryFeed`), so this stays a narrow single-purpose read.
 */
export async function getIndustryBySlug(slug: string) {
  return db.industry.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      socialImage: true,
      socialImageAlt: true,
      jsonLdStructuredData: true,
      nextjsMetadata: true,
    },
  });
}
