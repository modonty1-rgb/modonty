import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, CommentStatus, SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Everything the partner site's chrome (header nav · footer) and hero need, in ONE cached
 * read — identity, contact, trust fields, and the counts that decide which nav links exist
 * (no services → no «خدماته» link). Cached like the rest of the partner data so admin's
 * revalidateTag("clients") refreshes it. Live stats stay in `getClientPageData`.
 */
export async function getPartnerSite(decodedSlug: string) {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");
  return db.client.findUnique({
    where: { slug: decodedSlug, subscriptionStatus: SubscriptionStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      slug: true,
      seoTitle: true,
      slogan: true,
      description: true,
      seoDescription: true,
      phone: true,
      email: true,
      url: true,
      sameAs: true,
      addressStreet: true,
      addressNeighborhood: true,
      addressCity: true,
      addressLatitude: true,
      addressLongitude: true,
      foundingDate: true,
      legalName: true,
      legalForm: true,
      commercialRegistrationNumber: true,
      verificationImageUrl: true,
      openingHoursSpecification: true,
      ctaMode: true,
      ctaLabel: true,
      ctaUrl: true,
      brandGuidelines: true,
      services: true,
      achievements: true,
      credentials: true,
      teamMembers: true,
      industry: { select: { name: true } },
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true, width: true, height: true } },
      _count: {
        select: {
          articles: { where: { status: ArticleStatus.PUBLISHED } },
          reviews: { where: { status: CommentStatus.APPROVED } },
          clientFaqs: { where: { status: "PUBLISHED" } },
          media: { where: { type: "GALLERY" } },
        },
      },
    },
  });
}

export type PartnerSite = NonNullable<Awaited<ReturnType<typeof getPartnerSite>>>;
