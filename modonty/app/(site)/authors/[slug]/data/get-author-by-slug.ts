import { db } from "@/lib/db";

// Moved here unchanged from `authors/[slug]/page.tsx` (7 Oct 2026) so the page and the reader
// mobile API read ONE source. Uncached, as it was in the page.
export async function getAuthorBySlug(slug: string) {
  return db.author.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      firstName: true,
      lastName: true,
      bio: true,
      image: true,
      imageAlt: true,
      url: true,
      jobTitle: true,
      verificationStatus: true,
      email: true,
      linkedIn: true,
      twitter: true,
      facebook: true,
      sameAs: true,
      credentials: true,
      expertiseAreas: true,
      memberOf: true,
      seoTitle: true,
      seoDescription: true,
      canonicalUrl: true,
      jsonLdStructuredData: true,
      nextjsMetadata: true,
    },
  });
}
